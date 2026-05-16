const { body } = require('express-validator');
const createProjectValidator = [
  body('name').trim().notEmpty().withMessage('Project name required'),
];
module.exports = { createProjectValidator };
