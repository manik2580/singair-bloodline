const express = require('express');
const router = express.Router();



router.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('auth/login', {
    title: 'Admin Login',
    layout: 'layouts/auth.ejs', 
    activePage: 'login',
    });
});

module.exports = router;