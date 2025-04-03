var express = require('express');
var router = express.Router();
const mongoose = require('../db/db');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const isUserLoggedIn = require('../middlewares/user');

// ********* USER's GET ROUTES ********* //

// Home Page
router.get('/', isUserLoggedIn, function (req, res) {
  res.render('index', { user: req.session.user || null });
});

// User's Registration Page
router.get('/userRegister', (req, res) => {
  res.render('userRegister');
});

// User's Login Page
router.get('/userLogin', (req, res) => {
  res.render('userLogin');
});

// Profile Update Page
router.get('/profileUpdate', isUserLoggedIn, async (req, res) => {
  const user = await User.findById(req.session.user._id);
  res.render('profileUpdate', {
    user,
    success: req.flash('success'),
    error: req.flash('error'),
  });
});

// ************ USER's POST ROUTES ********* //

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, username, userID, email, password } = req.body;

    if (!name || !username || !userID || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/userRegister');
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      req.flash('error', 'Username or Email already taken.');
      return res.redirect('/userRegister');
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      userID,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    req.flash('success', 'Registration successful! You can now log in.');
    res.redirect('/userLogin');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Something went wrong, please try again.');
    res.redirect('/userRegister');
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { userID, username, password } = req.body;

    // Find user by userID or username
    const user = await User.findOne({ $or: [{ userID }, { username }] });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.flash('error', 'Invalid User ID, Username, or Password.');
      return res.redirect('/userLogin');
    }

    req.session.user = user;
    req.flash('success', 'Logged in successfully!');
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Something went wrong, please try again.');
    res.redirect('/userLogin');
  }
});

// User's Profile Update Route
router.post('/profileUpdate', isUserLoggedIn, async (req, res) => {
  try {
    const {
      name,
      username,
      userID,
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;
    const userId = req.session.user._id;

    const user = await User.findById(userId);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/profileUpdate');
    }

    if (
      currentPassword &&
      !(await bcrypt.compare(currentPassword, user.password))
    ) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/profileUpdate');
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { userID }],
      _id: { $ne: userId },
    });

    if (existingUser) {
      req.flash(
        'error',
        'Username or User ID already exists. Please choose another one.'
      );
      return res.redirect('/profileUpdate');
    }

    const updateFields = { name, username, userID };

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        req.flash('error', 'New password and confirm password do not match.');
        return res.redirect('/profileUpdate');
      }
      updateFields.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });
    req.session.user = updatedUser;

    req.flash('success', 'Profile updated successfully!');
    res.redirect('/profileUpdate');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to update profile.');
    res.redirect('/profileUpdate');
  }
});

// User Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      req.flash('error', 'Logout failed. Try again!');
      return res.redirect('/');
    }
    res.redirect('/userLogin');
  });
});

module.exports = router;
