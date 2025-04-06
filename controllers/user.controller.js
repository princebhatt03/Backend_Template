const User = require('../models/user');
const bcrypt = require('bcrypt');

function userController() {
  return {
    // ******** USER's GET ROUTES ********* //

    // User's Home Page
    homePage(req, res) {
      res.render('user/userHome', { user: req.session.user || null });
    },

    // User Registration Page
    userRegisterPage(req, res) {
      res.render('user/userRegister');
    },

    // User Login Page
    userLoginPage(req, res) {
      res.render('user/userLogin');
    },

    // Profile Update Page
    async profileUpdatePage(req, res) {
      const user = await User.findById(req.session.user._id);
      res.render('user/profileUpdate', {
        user,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    },

    // ********* USER's POST ROUTES ********* //

    // User Registration Controller
    async userRegister(req, res) {
      try {
        const { name, username, userID, email, password } = req.body;

        if (!name || !username || !userID || !email || !password) {
          req.flash('error', 'All fields are required.');
          return res.redirect('/userRegister');
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({
          $or: [{ email }, { username }],
        });
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
    },

    // User Login Controller
    async userLogin(req, res) {
      try {
        const { userID, username, password } = req.body;

        if (!userID || !username || !password) {
          req.flash('error', 'All fields are required.');
          return res.redirect('/userLogin');
        }

        // Check for user
        const user = await User.findOne({ userID, username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          req.flash('error', 'Invalid User ID, Username, or Password.');
          return res.redirect('/userLogin');
        }

        // Set session and redirect
        req.session.user = user;
        res.redirect('/userHome');
      } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong, please try again.');
        res.redirect('/userLogin');
      }
    },

    // User Profile Update Controller
    async profileUpdate(req, res) {
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
            req.flash(
              'error',
              'New password and confirm password do not match.'
            );
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
    },

    // User Logout Controller
    async userLogout(req, res) {
      try {
        req.session.destroy(err => {
          if (err) {
            console.error(err);
            req.flash('error', 'Something went wrong, please try again.');
            return res.redirect('/userHome');
          }
          res.clearCookie('connect.sid');
          res.redirect('/userLogin');
        });
      } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong, please try again.');
        res.redirect('/userHome');
      }
    },
  };
}

module.exports = userController;
