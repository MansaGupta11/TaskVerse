const { body } = require('express-validator');
const createTaskValidator = [
  body('title').trim().notEmpty().withMessage('Task title required'),
  body('projectId').notEmpty().withMessage('projectId required'),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
];
const updateStatusValidator = [
  body('status').isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Valid status required'),
];
module.exports = { createTaskValidator, updateStatusValidator };
