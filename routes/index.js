var express = require('express');
var router = express.Router();
const mongoose = require('../db/db');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const isUserLoggedIn = require('../middlewares/user');

// ********* USER's GET ROUTES ********* //

// Home Page
router.get('/', isUserLoggedIn, function (req, res, next) {
  res.render('index', { user: req.session.user || null });
});

// User's Registration Page
router.get('/userRegister', async (req, res) => {
  res.render('userRegister');
});

// User's Login Page
router.get('/userLogin', async (req, res) => {
  res.render('userLogin');
});

// ************ USER's POST ROUTES ********* //

// User's Registration
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

// User's Login
router.post('/login', async (req, res) => {
  try {
    const { userID, username, password } = req.body;

    // Find user by either userID or username
    const user = await User.findOne({
      $or: [{ userID: userID }, { username: username }],
    });

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

// User's Logout
// This route will destroy the session and redirect to the login page
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
