const { body } = require('express-validator');

const taskValidators = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .trim(),
  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isMongoId().withMessage('Invalid project ID'),
];

module.exports = { taskValidators };
