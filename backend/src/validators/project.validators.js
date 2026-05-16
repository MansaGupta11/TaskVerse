const { body } = require('express-validator');

const projectValidators = [
  body('name')
    .notEmpty().withMessage('Project name is required')
    .trim(),
];

module.exports = { projectValidators };
