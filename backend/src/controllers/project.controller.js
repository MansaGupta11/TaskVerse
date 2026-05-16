const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

function formatTask(t) {
  const id = t.id || (t._id && t._id.toString()) || null;
  const assignees = Array.isArray(t.assigneeIds)
    ? t.assigneeIds
        .filter(a => a && typeof a === 'object')
        .map(a => ({
          id: a.id || a._id?.toString(),
          name: a.name,
          email: a.email,
          avatar: a.avatar || '',
        }))
    : [];
  return {
    ...t,
    id,
    assignees,
    assignee: assignees[0] || null,
    projectId: t.projectId
      ? (t.projectId._id?.toString() || t.projectId.toString())
      : null,
  };
}

async function buildProjectDetail(project) {
  const proj = project.toObject ? project.toObject({ virtuals: true }) : project;

  const memberUserIds = (proj.members || []).map(m => m.userId);
  const memberUsers = await User.find({ _id: { $in: memberUserIds } })
    .select('name email role avatar')
    .lean();
  const memberMap = {};
  memberUsers.forEach(u => { memberMap[u._id.toString()] = u; });

  const members = (proj.members || []).map(m => {
    const u = memberMap[m.userId.toString()] || {};
    return {
      id: m.userId.toString(),
      name: u.name || null,
      email: u.email || null,
      role: u.role || 'MEMBER',
      avatar: u.avatar || '',
      joinedAt: m.joinedAt,
    };
  });

  const rawTasks = await Task.find({ projectId: proj._id })
    .populate('assigneeIds', 'name email avatar')
    .lean({ virtuals: true });

  const tasks = rawTasks.map(formatTask);

  return {
    id: proj._id.toString(),
    _id: proj._id,
    name: proj.name,
    description: proj.description,
    owner: proj.ownerId,
    members,
    tasks,
    createdAt: proj.createdAt,
    updatedAt: proj.updatedAt,
  };
}

const getAll = async (req, res, next) => {
  try {
    const filter = req.user.role === 'ADMIN' ? {} : { 'members.userId': req.user.id };
    const projects = await Project.find(filter)
      .populate('ownerId', 'name email avatar')
      .lean({ virtuals: true });

    const projectIds = projects.map(p => p._id);
    const taskCounts = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
    ]);
    const taskCountMap = {};
    taskCounts.forEach(t => { taskCountMap[t._id.toString()] = t.count; });

    const result = projects.map(p => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      owner: p.ownerId,
      memberCount: p.members?.length || 0,
      taskCount: taskCountMap[p._id.toString()] || 0,
      createdAt: p.createdAt,
    }));

    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, memberIds } = req.body;
    const ownerId = req.user.id;
    const uniqueIds = [...new Set([ownerId, ...(Array.isArray(memberIds) ? memberIds : [])])];
    const project = await Project.create({
      name,
      description: description || '',
      ownerId,
      members: uniqueIds.map(userId => ({ userId })),
    });
    const populated = await Project.findById(project._id).populate('ownerId', 'name email avatar');
    const data = await buildProjectDetail(populated);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('ownerId', 'name email avatar');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (req.user.role !== 'ADMIN') {
      if (!project.members.some(m => m.userId.toString() === req.user.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: not a project member' });
      }
    }
    const data = await buildProjectDetail(project);
    return res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, description, memberIds } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (Array.isArray(memberIds)) {
      const existing = await Project.findById(req.params.id).select('ownerId').lean();
      if (existing) {
        const ownerId = existing.ownerId.toString();
        const uniqueIds = [...new Set([ownerId, ...memberIds])];
        updates.members = uniqueIds.map(userId => ({ userId }));
      }
    }
    const project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('ownerId', 'name email avatar');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    const data = await buildProjectDetail(project);
    return res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();
    return res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (project.members.some(m => m.userId.toString() === userId.toString())) {
      return res.status(409).json({ success: false, message: 'User is already a member' });
    }
    project.members.push({ userId });
    await project.save();
    const populated = await Project.findById(project._id).populate('ownerId', 'name email avatar');
    const data = await buildProjectDetail(populated);
    return res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    project.members = project.members.filter(m => m.userId.toString() !== userId.toString());
    await project.save();
    const populated = await Project.findById(project._id).populate('ownerId', 'name email avatar');
    const data = await buildProjectDetail(populated);
    return res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listProjects: getAll,
  createProject: create,
  getProject: getById,
  updateProject: update,
  deleteProject,
  addMember,
  removeMember,
};
