const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username is already taken' });
    }

    const user = await User.create({ name, username: username.toLowerCase(), email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      careerProfile: user.careerProfile || {},
      personalStreak: user.personalStreak || 0,
      lastActiveDate: user.lastActiveDate || null,
      lastLessonCompletedDate: user.lastLessonCompletedDate || null,
      totalXP: user.totalXP || 0,
      currentLevel: user.currentLevel || 1,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username || null,
      email: user.email,
      careerProfile: user.careerProfile || {},
      personalStreak: user.personalStreak || 0,
      lastActiveDate: user.lastActiveDate || null,
      lastLessonCompletedDate: user.lastLessonCompletedDate || null,
      totalXP: user.totalXP || 0,
      currentLevel: user.currentLevel || 1,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    username: req.user.username || null,
    email: req.user.email,
    careerProfile: req.user.careerProfile || {},
    personalStreak: req.user.personalStreak || 0,
    lastActiveDate: req.user.lastActiveDate || null,
    lastLessonCompletedDate: req.user.lastLessonCompletedDate || null,
    totalXP: req.user.totalXP || 0,
    currentLevel: req.user.currentLevel || 1,
  });
};

module.exports = { signup, login, getMe };
