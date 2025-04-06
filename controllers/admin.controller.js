const Admin = require('../models/admin');
const bcrypt = require('bcrypt');

function adminController() {
  return {
    // ******** ADMIN's GET ROUTES ********* //

    // Admin Home Page
    adminHomePage(req, res) {
      res.render('admin/adminHome', { admin: req.session.admin || null });
    },

    // Admin Registration Page
    adminRegisterPage(req, res) {
      res.render('admin/adminRegister');
    },

    // Admin Login Page
    adminLoginPage(req, res) {
      res.render('admin/adminLogin');
    },

    // Admin Profile Page
    adminProfilePage(req, res) {
      res.render('admin/adminProfile');
    },

    // ******** ADMIN's POST ROUTES ********* //

    // Admin Registration Controller
    async adminRegister(req, res) {
      const { adminName, adminUsername, adminID, email, password } = req.body;

      // Basic validation
      if (!adminName || !adminUsername || !adminID || !email || !password) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/adminRegister');
      }

      try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
          $or: [{ adminUsername }, { adminID }, { email }],
        });

        if (existingAdmin) {
          req.flash('error', 'Admin already exists.');
          return res.redirect('/adminRegister');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const newAdmin = new Admin({
          adminName,
          adminUsername,
          adminID,
          email,
          password: hashedPassword,
        });

        await newAdmin.save();
        req.flash('success', 'Registration successful! You can now log in.');
        res.redirect('/adminLogin');
      } catch (err) {
        console.error('Admin Registration Error:', err);
        req.flash('error', 'Something went wrong, please try again.');
        res.redirect('/adminRegister');
      }
    },

    // Admin Login Controller
    async adminLogin(req, res) {
      const { adminID, password } = req.body;

      // Basic validation
      if (!adminID || !password) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/adminLogin');
      }

      try {
        // Find the admin by adminID
        const admin = await Admin.findOne({ adminID });
        if (!admin) {
          req.flash('error', 'Invalid Admin ID or Password.');
          return res.redirect('/adminLogin');
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          req.flash('error', 'Invalid Admin ID or Password.');
          return res.redirect('/adminLogin');
        }

        // Store admin session
        req.session.admin = admin;
        req.flash('success', 'Logged in successfully!');
        res.redirect('/adminHome');
      } catch (err) {
        console.error('Admin Login Error:', err);
        req.flash('error', 'Something went wrong, please try again.');
        res.redirect('/adminLogin');
      }
    },

    // Admin Logout Controller
    async adminLogout(req, res) {
      req.session.destroy(err => {
        if (err) {
          req.flash('error', 'Logout failed. Try again!');
          return res.redirect('/adminHome');
        }
        res.redirect('/adminLogin');
      });
    },
  };
}

module.exports = adminController;
