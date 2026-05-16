const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

const PASSWORD_RULES = [
  { test: p => p.length >= 8 && p.length <= 15,                message: 'Password must be 8–15 characters' },
  { test: p => (p.match(/[A-Z]/g) || []).length >= 2,          message: 'Password must contain at least 2 uppercase letters' },
  { test: p => /[a-z]/.test(p),                                message: 'Password must contain at least 1 lowercase letter' },
  { test: p => /[0-9]/.test(p),                                message: 'Password must contain at least 1 number' },
  { test: p => /[^A-Za-z0-9\s]/.test(p),                       message: 'Password must contain at least 1 special character' },
  { test: p => !/\s/.test(p),                                  message: 'Password must not contain spaces' },
];

const validatePassword = (password) => {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) return rule.message;
  }
  return null;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const pwError = validatePassword(password);
    if (pwError) {
      return res.status(400).json({ success: false, message: pwError });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: 'MEMBER', avatar: avatar || '' });
    const token = signToken(user);
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = signToken(user);
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      },
    });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, message: 'User fetched', data: { user } });
  } catch (err) {
    next(err);
  }
};

const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const existing = await User.findOne({ email });
    return res.json({ success: true, data: { available: !existing } });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, me, checkEmail };
