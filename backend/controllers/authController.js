const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getAuthCookieOptions, getClearCookieOptions } = require('../utils/cookie');

// Helper to sign JWT token
const signToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign({ id }, secret, { expiresIn });
};

// @desc    Register a new user & set HTTP-only cookie
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create user in database
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    // Generate JWT
    const token = signToken(user._id);

    // Set token in secure HTTP-only cookie
    res.cookie('token', token, getAuthCookieOptions(req));

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }
    next(err);
  }
};

// @desc    Authenticate user & set HTTP-only cookie
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user and explicitly select password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT
    const token = signToken(user._id);

    // Set token in secure HTTP-only cookie
    res.cookie('token', token, getAuthCookieOptions(req));

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
};

// @desc    Log out user & clear HTTP-only auth cookie
// @route   POST /api/auth/logout
// @access  Public (or Private)
const logout = async (req, res) => {
  res.clearCookie('token', getClearCookieOptions(req));
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
