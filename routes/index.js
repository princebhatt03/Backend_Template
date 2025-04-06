var express = require('express');
var router = express.Router();
const mongoose = require('../db/db');
const bcrypt = require('bcrypt');
const Admin = require('../models/admin');
const isUserLoggedIn = require('../middlewares/user');
const isAdminLoggedIn = require('../middlewares/admin');
const userController = require('../controllers/user.controller');
const adminController = require('../controllers/admin.controller');

// ********* Home Page ********* //

router.get('/', (req, res) => {
  res.render('index');
});

// ********* USER's GET ROUTES ********* //

// User's Home Page
router.get('/userHome', isUserLoggedIn, userController().homePage);

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

// ******** ADMIN's GET ROUTES ********* //

// Admin Home Page
router.get('/adminHome', isAdminLoggedIn, adminController().adminHomePage);

// Admin Registration Page
router.get('/adminRegister', adminController().adminRegisterPage);

// Admin Login Page
router.get('/adminLogin', adminController().adminLoginPage);

// Admin Login Page
router.get(
  '/adminProfile',
  isAdminLoggedIn,
  adminController().adminProfilePage
);

// ******* ADMIN's POST ROUTES ********* //

// Admin Registration
router.post('/adminRegister', adminController().adminRegister);

// Admin Login
router.post('/adminLogin', adminController().adminLogin);

// Admin Logout
router.get('/adminLogout', adminController().adminLogout);

module.exports = router;
