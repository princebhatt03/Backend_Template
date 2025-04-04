var express = require('express');
var router = express.Router();
const mongoose = require('../db/db');
const User = require('../models/user');
const Admin = require('../models/admin');
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

// ******** ADMIN ROUTES ********* //

// Admin Home Page
router.get('/adminHome', (req, res) => {
  const admin = req.session.admin;
  if (!admin) {
    req.flash('error', 'Unauthorized access. Please log in.');
    return res.redirect('/adminLogin');
  }
  res.render('admin/adminHome', { admin });
});

// Admin Registration Page
router.get('/adminRegister', (req, res) => {
  res.render('admin/adminRegister', { messages: req.flash() });
});

// Admin Login Page
router.get('/adminLogin', (req, res) => {
  res.render('admin/adminLogin', { messages: req.flash() });
});

// Admin Login Page
router.get('/adminProfile', (req, res) => {
  res.render('admin/adminProfile');
});

// ******* ADMIN POST ROUTES ********* //

// Admin Registration
router.post('/adminRegister', async (req, res) => {
  const { adminName, adminUsername, adminID, email, password } = req.body;

  // Basic validation
  if (!adminName || !adminUsername || !adminID || !email || !password) {
    req.flash('error', 'All fields are required.');
    return res.redirect('/adminRegister');
  }

  try {
    // Check for existing admin
    const existingAdmin = await Admin.findOne({
      $or: [{ adminUsername }, { adminID }, { email }],
    });
    if (existingAdmin) {
      req.flash('error', 'Admin already exists.');
      return res.redirect('/adminRegister');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      adminName,
      adminUsername,
      adminID,
      email,
      password: hashedPassword,
    });

    // Save admin to database
    await newAdmin.save();
    req.flash('success', 'Registration successful! You can now log in.');
    res.redirect('/adminLogin');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong, please try again.');
    res.redirect('/adminRegister');
  }
});

// Admin Login
router.post('/adminLogin', async (req, res) => {
  const { adminID, adminUsername, password } = req.body;

  // Basic validation
  if (!adminID || !adminUsername || !password) {
    req.flash('error', 'All fields are required.');
    return res.redirect('/adminLogin');
  }

  try {
    // Check for admin
    const admin = await Admin.findOne({ adminID, adminUsername });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      req.flash('error', 'Invalid Admin ID, Username, or Password.');
      return res.redirect('/adminLogin');
    }

    // Establish session
    req.session.admin = admin;
    req.flash('success', 'Logged in successfully!');
    res.redirect('/adminHome');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong, please try again.');
    res.redirect('/adminLogin');
  }
});

// User Logout
router.get('/adminlogout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      req.flash('error', 'Logout failed. Try again!');
      return res.redirect('/');
    }
    res.redirect('/adminLogin');
  });
});

module.exports = router;
