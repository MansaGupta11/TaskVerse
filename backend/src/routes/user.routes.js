const express = require('express');
const router = express.Router();
const { listUsers, updateRole, deleteUser } = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(auth, requireRole('ADMIN'));
router.get('/', listUsers);
router.patch('/:id/role', updateRole);
router.delete('/:id', deleteUser);

module.exports = router;
