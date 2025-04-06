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
    async adminProfilePage(req, res) {
      try {
        const admin = await Admin.findById(req.session.admin._id);
        if (!admin) {
          req.flash('error', 'Admin not found.');
          return res.redirect('/adminDashboard');
        }
        res.render('admin/adminProfile', {
          admin,
          success: req.flash('success'),
          error: req.flash('error'),
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/adminHome');
      }
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

    async updateAdminProfile(req, res) {
      const { adminName, adminUsername, adminID, email } = req.body;

      // Basic validation
      if (!adminName || !adminUsername || !adminID || !email) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/adminProfile');
      }

      try {
        // Update admin profile
        await Admin.findByIdAndUpdate(req.session.admin._id, {
          adminName,
          adminUsername,
          adminID,
          email,
        });

        req.flash('success', 'Profile updated successfully!');
        res.redirect('/adminProfile');
      } catch (err) {
        console.error('Admin Profile Update Error:', err);
        req.flash('error', 'Something went wrong, please try again.');
        res.redirect('/adminProfile');
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

    // Admin Account Deletion Controller
    async adminDelete(req, res) {
      try {
        const { deletePassword } = req.body;
        const adminId = req.session.admin?._id; // Ensure session exists

        if (!adminId) {
          req.flash('error', 'Unauthorized access.');
          return res.redirect('/adminLogin'); // Redirect if session is missing
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
          req.flash('error', 'Admin not found.');
          return res.redirect('/adminProfile');
        }

        const isPasswordValid = await bcrypt.compare(
          deletePassword,
          admin.password
        );
        if (!isPasswordValid) {
          req.flash('error', 'Incorrect password.');
          return res.redirect('/adminProfile'); // Redirecting to adminProfile
        }

        await Admin.findByIdAndDelete(adminId);
        // req.session.destroy(); // Destroy session after deletion
        req.flash('success', 'Account deleted successfully.');
        res.redirect('/adminRegister');
      } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to delete account.');
        res.redirect('/adminProfile');
      }
    },
  };
}

module.exports = adminController;
