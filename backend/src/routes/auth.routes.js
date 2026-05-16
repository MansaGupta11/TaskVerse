const express = require('express');
const router = express.Router();
const { register, login, me, checkEmail } = require('../controllers/auth.controller');
const { registerValidator, loginValidator, emailCheckValidator } = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');
const auth = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/check-email', authLimiter, emailCheckValidator, validate, checkEmail);
router.get('/me', auth, me);

module.exports = router;
