const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().isLength({ min: 2 }).withMessage('Name min 2 chars'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  body('avatar').optional({ checkFalsy: true }).isString().withMessage('Avatar must be a string'),
];

const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const emailCheckValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
];

module.exports = { registerValidator, loginValidator, emailCheckValidator };
