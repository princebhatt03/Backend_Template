var express = require('express');
var router = express.Router();
const mongoose = require('../db/db');
const isUserLoggedIn = require('../middlewares/user');
const isAdminLoggedIn = require('../middlewares/admin');
const userController = require('../controllers/user.controller');
const adminController = require('../controllers/admin.controller');

// ********* Home Page ********* //
router.get('/', (req, res) => res.render('index'));

// ********* USER's GET ROUTES ********* //

// User's Home Page
router.get('/userHome', isUserLoggedIn, userController().homePage);

// User Registration
router.get('/userRegister', userController().userRegisterPage);

// User Login
router.get('/userLogin', userController().userLoginPage);

// User Profile
router.get(
  '/profileUpdate',
  isUserLoggedIn,
  userController().profileUpdatePage
);

// ********* USER's POST ROUTES ********* //

// User Registration Route
router.post('/register', userController().userRegister);

// User Login Route
router.post('/login', userController().userLogin);

// User Profile Update
router.post('/profileUpdate', isUserLoggedIn, userController().profileUpdate);

// User Account Deletion
router.post('/deleteAccount', isUserLoggedIn, userController().userDelete);

// User Logout
router.get('/logout', userController().userLogout);

// ********* ADMIN's GET ROUTES ********* //

// Admin Home Page
router.get('/adminHome', isAdminLoggedIn, adminController().adminHomePage);

// Admin Registration
router.get('/adminRegister', adminController().adminRegisterPage);

// Admin Login
router.get('/adminLogin', adminController().adminLoginPage);

// Admin Profile
router.get(
  '/adminProfile',
  isAdminLoggedIn,
  adminController().adminProfilePage
);

// ******** Admin's POST ROUTES ********* //

// Admin Registration Route
router.post('/adminRegister', adminController().adminRegister);

// Admin Login Route
router.post('/adminLogin', adminController().adminLogin);

// Admin Profile Update Route
router.post(
  '/adminProfileUpdate',
  isAdminLoggedIn,
  adminController().updateAdminProfile
);

// Admin Delete Route
router.post(
  '/adminDeleteAccount',
  isAdminLoggedIn,
  adminController().adminDelete
);

// Admin Logout
router.get('/adminLogout', adminController().adminLogout);

module.exports = router;
