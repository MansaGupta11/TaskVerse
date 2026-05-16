const Project = require('../models/Project');
const Task = require('../models/Task');

function formatTask(t) {
  const id = t.id || (t._id && t._id.toString()) || null;

  const assignees = (t.assigneeIds || []).filter(Boolean).map(u => {
    if (typeof u !== 'object') return null;
    return {
      id: u.id || u._id?.toString(),
      name: u.name,
      email: u.email,
      avatar: u.avatar || '',
    };
  }).filter(Boolean);

  return {
    ...t,
    id,
    assignees,
    assignee: assignees[0] || null,
    project: t.projectId && typeof t.projectId === 'object' ? {
      id: t.projectId.id || t.projectId._id?.toString(),
      name: t.projectId.name,
    } : null,
    projectId: t.projectId && typeof t.projectId === 'object'
      ? (t.projectId.id || t.projectId._id?.toString())
      : (t.projectId?.toString() || null),
  };
}

function formatMembers(members) {
  return (members || []).map(m => ({
    id: m.userId?._id?.toString() || m.userId?.toString() || null,
    name: m.userId?.name || 'Unknown',
    email: m.userId?.email || null,
    avatar: m.userId?.avatar || '',
    role: m.userId?.role || m.role || 'MEMBER',
  }));
}

const emptyStats = () => ({ total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 });

function breakdownGroupStage(now) {
  return {
    $group: {
      _id: { projectId: '$projectId', assigneeId: '$assigneeId' },
      total: { $sum: 1 },
      todo: { $sum: { $cond: [{ $eq: ['$status', 'TODO'] }, 1, 0] } },
      inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
      done: { $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] } },
      overdue: {
        $sum: {
          $cond: [
            {
              $and: [
                { $ne: ['$dueDate', null] },
                { $lt: ['$dueDate', now] },
                { $ne: ['$status', 'DONE'] },
              ],
            },
            1,
            0,
          ],
        },
      },
    },
  };
}

const getStats = async (req, res, next) => {
  try {
    const now = new Date();

    if (req.user.role === 'ADMIN') {
      const [
        totalProjects,
        totalTasks,
        inProgressCount,
        overdueCount,
        doneCount,
        statusAgg,
        priorityAgg,
        breakdownAgg,
        allProjects,
      ] = await Promise.all([
        Project.countDocuments(),
        Task.countDocuments(),
        Task.countDocuments({ status: 'IN_PROGRESS' }),
        Task.countDocuments({ dueDate: { $lt: now }, status: { $ne: 'DONE' } }),
        Task.countDocuments({ status: 'DONE' }),
        Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
        Task.aggregate([breakdownGroupStage(now)]),
        Project.find()
          .sort({ createdAt: -1 })
          .populate('members.userId', 'name email avatar role')
          .lean(),
      ]);

      const statusDistribution = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
      statusAgg.forEach(s => { if (s._id) statusDistribution[s._id] = s.count; });
      const priorityDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0 };
      priorityAgg.forEach(p => { if (p._id) priorityDistribution[p._id] = p.count; });

      const breakdownMap = {};
      breakdownAgg.forEach(row => {
        const pid = row._id.projectId ? row._id.projectId.toString() : null;
        if (!pid) return;
        const aid = row._id.assigneeId ? row._id.assigneeId.toString() : 'unassigned';
        if (!breakdownMap[pid]) breakdownMap[pid] = {};
        breakdownMap[pid][aid] = {
          total: row.total,
          todo: row.todo,
          inProgress: row.inProgress,
          done: row.done,
          overdue: row.overdue,
        };
      });

      const projectBreakdown = allProjects.map(p => {
        const pid = p._id.toString();
        const projStats = breakdownMap[pid] || {};
        const formatted = formatMembers(p.members);
        const memberIds = new Set(formatted.map(m => m.id));
        const members = formatted.map(m => ({
          ...m,
          ...(projStats[m.id] || emptyStats()),
        }));
        const unassigned = emptyStats();
        let hasUnassigned = false;
        Object.keys(projStats).forEach(aid => {
          if (aid === 'unassigned' || !memberIds.has(aid)) {
            const s = projStats[aid];
            unassigned.total += s.total;
            unassigned.todo += s.todo;
            unassigned.inProgress += s.inProgress;
            unassigned.done += s.done;
            unassigned.overdue += s.overdue;
            hasUnassigned = true;
          }
        });
        const totals = emptyStats();
        Object.values(projStats).forEach(s => {
          totals.total += s.total;
          totals.todo += s.todo;
          totals.inProgress += s.inProgress;
          totals.done += s.done;
          totals.overdue += s.overdue;
        });
        return {
          id: pid,
          name: p.name,
          ...totals,
          members,
          unassigned: hasUnassigned ? unassigned : null,
        };
      });

      const recentProjects = allProjects.slice(0, 6).map(p => {
        const pb = projectBreakdown.find(x => x.id === p._id.toString());
        return {
          id: p._id.toString(),
          name: p.name,
          description: p.description || '',
          memberCount: p.members?.length || 0,
          members: formatMembers(p.members),
          taskCount: pb ? pb.total : 0,
        };
      });

      return res.json({
        success: true,
        data: {
          totalProjects,
          totalTasks,
          inProgressTasks: inProgressCount,
          overdueTasks: overdueCount,
          doneTasks: doneCount,
          recentProjects,
          statusDistribution,
          priorityDistribution,
          projectBreakdown,
        },
      });
    }

    // MEMBER — scope all queries to assigneeIds
    const myProjects = await Project.find({ 'members.userId': req.user.id })
      .sort({ createdAt: -1 })
      .populate('members.userId', 'name email avatar role')
      .lean();
    const projectIds = myProjects.map(p => p._id);

    const [totalTasks, inProgressCount, overdueCount, doneCount, myTasksDocs, taskCountsByProject] =
      await Promise.all([
        Task.countDocuments({ assigneeIds: req.user.id }),
        Task.countDocuments({ assigneeIds: req.user.id, status: 'IN_PROGRESS' }),
        Task.countDocuments({
          assigneeIds: req.user.id,
          dueDate: { $lt: now },
          status: { $ne: 'DONE' },
        }),
        Task.countDocuments({ assigneeIds: req.user.id, status: 'DONE' }),
        Task.find({ assigneeIds: req.user.id })
          .populate('projectId', 'name')
          .populate('assigneeIds', 'name email avatar')
          .lean({ virtuals: true }),
        Task.aggregate([
          { $match: { projectId: { $in: projectIds } } },
          { $group: { _id: '$projectId', count: { $sum: 1 } } },
        ]),
      ]);

    const taskCountMap = {};
    taskCountsByProject.forEach(t => { taskCountMap[t._id.toString()] = t.count; });

    return res.json({
      success: true,
      data: {
        totalProjects: myProjects.length,
        totalTasks,
        inProgressTasks: inProgressCount,
        overdueTasks: overdueCount,
        doneTasks: doneCount,
        recentProjects: myProjects.slice(0, 6).map(p => ({
          id: p._id.toString(),
          name: p.name,
          description: p.description || '',
          memberCount: p.members?.length || 0,
          members: formatMembers(p.members),
          taskCount: taskCountMap[p._id.toString()] || 0,
        })),
        myTasks: myTasksDocs.map(formatTask),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
