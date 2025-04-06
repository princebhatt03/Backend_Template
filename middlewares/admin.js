module.exports = (req, res, next) => {
  if (req.session && req.session.admin) {
    return next(); // Admin is logged in, proceed to the requested page
  }
  req.flash('error', 'You must be logged in as an admin to access this page.');
  res.redirect('/adminLogin'); // Redirect to admin login page
};
