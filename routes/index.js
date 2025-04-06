var express = require('express');
var router = express.Router();
const mongoose = require('../db/db');
const User = require('../models/user');
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const isUserLoggedIn = require('../middlewares/user');
const userController = require('../controllers/user.controller');

// ********* USER's GET ROUTES ********* //

// Home Page
router.get('/', isUserLoggedIn, userController().homePage);

// User's Registration Page
router.get('/userRegister', userController().userRegisterPage);

// User's Login Page
router.get('/userLogin', userController().userLoginPage);

// Profile Update Page
router.get(
  '/profileUpdate',
  isUserLoggedIn,
  userController().profileUpdatePage
);

// ************ USER's POST ROUTES ********* //

// User Registration
router.post('/register', userController().userRegister);

// User Login
router.post('/login', userController().userLogin);

// User's Profile Update Route
router.post('/profileUpdate', isUserLoggedIn, userController().profileUpdate);

// User Logout
router.get('/logout', userController().userLogout);

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
