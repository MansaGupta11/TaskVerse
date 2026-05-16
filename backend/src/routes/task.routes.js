const express = require('express');
const router = express.Router();
const { createTask, getTask, updateTask, deleteTask, updateTaskStatus, listMyTasks, listAllTasks } = require('../controllers/task.controller');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { createTaskValidator, updateStatusValidator } = require('../validators/task.validator');
const validate = require('../middleware/validate.middleware');

router.use(auth);
// CRITICAL: /mine MUST be registered BEFORE /:id
router.get('/mine', listMyTasks);
router.get('/', requireRole('ADMIN'), listAllTasks);
router.post('/', requireRole('ADMIN'), createTaskValidator, validate, createTask);
router.get('/:id', getTask);
router.patch('/:id/status', updateStatusValidator, validate, updateTaskStatus);
router.patch('/:id', requireRole('ADMIN'), updateTask);
router.delete('/:id', requireRole('ADMIN'), deleteTask);

module.exports = router;
