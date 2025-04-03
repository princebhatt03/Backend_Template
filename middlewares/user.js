module.exports = (req, res, next) => {
  if (req.session && req.session.user) {
    return next(); // User is logged in, proceed to the requested page
  }
  req.flash('error', 'You must be logged in to access this page.');
  res.redirect('/userLogin'); // Redirect to login page
};
