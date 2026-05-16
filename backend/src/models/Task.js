const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status:      { type: String, enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' },
  priority:    { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  dueDate:     { type: Date, default: null },
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assigneeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assigneeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  creatorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
