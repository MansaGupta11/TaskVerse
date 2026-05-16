const express = require('express');
const router = express.Router();
const { listProjects, createProject, getProject, updateProject, deleteProject, addMember, removeMember } = require('../controllers/project.controller');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { createProjectValidator } = require('../validators/project.validator');
const validate = require('../middleware/validate.middleware');

router.use(auth);
router.get('/', listProjects);
router.post('/', requireRole('ADMIN'), createProjectValidator, validate, createProject);
router.get('/:id', getProject);
router.patch('/:id', requireRole('ADMIN'), updateProject);
router.delete('/:id', requireRole('ADMIN'), deleteProject);
router.post('/:id/members', requireRole('ADMIN'), addMember);
router.delete('/:id/members/:userId', requireRole('ADMIN'), removeMember);

module.exports = router;
