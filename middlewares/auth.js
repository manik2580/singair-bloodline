// middlewares/auth.js
function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.redirect('/auth/login');
}

module.exports = { isAdmin };
