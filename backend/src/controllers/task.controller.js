const Task = require('../models/Task');
const Project = require('../models/Project');

function formatTask(task) {
  const t = task.toObject ? task.toObject({ virtuals: true }) : task;
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

function getPopulatedTask(id) {
  return Task.findById(id)
    .populate('projectId', 'name')
    .populate('assigneeIds', 'name email avatar')
    .populate('creatorId', 'name email avatar');
}

const getMine = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assigneeIds: req.user.id })
      .populate('projectId', 'name')
      .populate('assigneeIds', 'name email avatar')
      .populate('creatorId', 'name email avatar');
    return res.json({ success: true, data: tasks.map(formatTask) });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.projectId) filter.projectId = req.query.projectId;
    const tasks = await Task.find(filter)
      .populate('projectId', 'name')
      .populate('assigneeIds', 'name email avatar')
      .populate('creatorId', 'name email avatar');
    return res.json({ success: true, data: tasks.map(formatTask) });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, description, projectId, assigneeIds, priority, dueDate, status } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    const ids = Array.isArray(assigneeIds) ? assigneeIds.filter(Boolean) : [];
    const created = await Task.create({
      title,
      description: description || '',
      projectId,
      assigneeIds: ids,
      assigneeId: ids[0] || null,
      priority: priority || 'MEDIUM',
      dueDate: dueDate || null,
      status: status || 'TODO',
      creatorId: req.user.id,
    });
    const populated = await getPopulatedTask(created._id);
    return res.status(201).json({ success: true, data: formatTask(populated) });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const task = await getPopulatedTask(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (req.user.role !== 'ADMIN') {
      const projectId = task.projectId?._id || task.projectId;
      const project = await Project.findById(projectId);
      if (!project || !project.members.some(m => m.userId.toString() === req.user.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: not a project member' });
      }
    }
    return res.json({ success: true, data: formatTask(task) });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assigneeIds } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (assigneeIds !== undefined) {
      const ids = Array.isArray(assigneeIds) ? assigneeIds.filter(Boolean) : [];
      updates.assigneeIds = ids;
      updates.assigneeId = ids[0] || null;
    }
    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    const populated = await getPopulatedTask(task._id);
    return res.json({ success: true, data: formatTask(populated) });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    await task.deleteOne();
    return res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(422).json({ success: false, message: 'Invalid status value' });
    }
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (req.user.role !== 'ADMIN') {
      if (!task.assigneeIds?.some(id => id.toString() === req.user.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: not assigned to this task' });
      }
    }
    task.status = status;
    await task.save();
    const populated = await getPopulatedTask(task._id);
    return res.json({ success: true, data: formatTask(populated) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask: create,
  getTask: getById,
  updateTask: update,
  deleteTask,
  updateTaskStatus: updateStatus,
  listMyTasks: getMine,
  listAllTasks: getAll,
};
