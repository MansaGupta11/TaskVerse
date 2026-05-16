const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const getAll = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    return res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || !['ADMIN', 'MEMBER'].includes(role)) {
      return res.status(422).json({ success: false, message: 'Role must be ADMIN or MEMBER' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Detach the deleted user from every task. assigneeIds is the source of truth;
    // assigneeId is a legacy mirror of assigneeIds[0] and must stay in sync.
    await Task.updateMany(
      { $or: [{ assigneeIds: user._id }, { assigneeId: user._id }] },
      [
        {
          $set: {
            assigneeIds: {
              $filter: {
                input: { $ifNull: ['$assigneeIds', []] },
                cond: { $ne: ['$$this', user._id] },
              },
            },
          },
        },
        {
          $set: {
            assigneeId: {
              $cond: [
                { $eq: ['$assigneeId', user._id] },
                { $ifNull: [{ $arrayElemAt: ['$assigneeIds', 0] }, null] },
                '$assigneeId',
              ],
            },
          },
        },
      ]
    );
    await Task.updateMany({ creatorId: user._id }, { $set: { creatorId: null } });
    await Project.updateMany(
      { 'members.userId': id },
      { $pull: { members: { userId: id } } }
    );

    const ownedProjects = await Project.find({ ownerId: id });
    for (const project of ownedProjects) {
      await Task.deleteMany({ projectId: project._id });
      await project.deleteOne();
    }

    await user.deleteOne();
    return res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers: getAll, updateRole, deleteUser };
