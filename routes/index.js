var express = require('express');
var router = express.Router();
const mongoose = require('../db/db');
const isUserLoggedIn = require('../middlewares/user');
const isAdminLoggedIn = require('../middlewares/admin');
const userController = require('../controllers/user.controller');
const adminController = require('../controllers/admin.controller');
const productController = require('../controllers/product.controller');
const upload = require('../config/multer.config');
const Product = require('../models/product');

// ********* Home Page ********* //
router.get('/', (req, res) => res.render('index'));

// ********* USER's GET ROUTES ********* //

// User's Home Page
router.get('/userHome', isUserLoggedIn, userController().homePage);

// User Registration
router.get('/userRegister', userController().userRegisterPage);
// product.imageURL;
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

// ******** Products Management Routes ********* //

// Products Render GET Routes
router.get('/products', isAdminLoggedIn, productController.productPage);

// Products Upload POST Route
router.post(
  '/uploadProduct',
  isAdminLoggedIn,
  upload.single('productImage'),
  productController.productUpload
);

// Routes for Delete Product
router.post('/delete/:id', isAdminLoggedIn, productController.deleteProduct);

// Admin Logout Route
router.get('/adminLogout', adminController().adminLogout);

// Route to show edit form
router.get(
  '/editProduct/:id',
  isAdminLoggedIn,
  productController.editProductPage
);

// Route to handle product update with image upload
router.post(
  '/updateProduct/:id',
  isAdminLoggedIn,
  upload.single('image'),
  productController.updateProduct
);

module.exports = router;
