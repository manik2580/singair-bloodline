const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.render('index', { 
      title: 'হোম পেজ', 
      activePage: 'home' ,
    });
});

// About page
router.get('/about', (req, res) => {
  res.render('about', { title: 'আমাদের সম্পর্কে', activePage: 'about'  });
});

// Donor registration page
router.get('/register', (req, res) => {
  res.render('register', { title: 'ডোনার রেজিস্ট্রেশন', activePage: 'register' });
});

// Donor search page
const Donor = require('../models/Donor');
router.get('/search', async(req, res) => {
  try {
    const { bloodGroup, city, address } = req.query;

    // Build filter object
    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = city;
    if (address) filter.address = { $regex: address, $options: 'i' }; // case-insensitive search

    // Fetch donors from DB
    const donors = await Donor.find(filter).sort({ name: 1 }); // sort by name

    res.render('search', { 
      title: 'ডোনার খুঁজুন', 
      activePage: 'search', 
      donors,
      filters: { bloodGroup, city, address } // preserve filters in form
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// app.get('/login', (req, res) => {
//   if (req.session && req.session.isAdmin) {
//     return res.redirect('/admin/dashboard');
//   }
//   res.render('login', { title: 'Admin Login' });
// });

module.exports = router;
