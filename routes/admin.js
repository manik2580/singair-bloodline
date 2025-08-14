const express = require('express');
const router = express.Router();

// Middleware to protect admin routes
function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

router.use(isAdmin);

router.get('/dashboard', async(req, res) => {
  try {
    const donors = await Donor.find();

    const totalDonors = donors.length;

    let availableDonors = 0;
    let notAvailableDonors = 0;
    let donatedBefore = 0;

    const now = new Date();

    donors.forEach(donor => {
      // Donated before count
      if(donor.is_donated_before) donatedBefore++;

      // Last donation available or not
      if(donor.lastDonation) {
        const last = new Date(donor.lastDonation);
        const diffMonths = (now.getFullYear() - last.getFullYear()) * 12 + (now.getMonth() - last.getMonth());
        if(diffMonths < 4) availableDonors++;
        else notAvailableDonors++;
      } else {
        notAvailableDonors++;
      }
    });

    res.render('admin/dashboard', {
      title: 'ড্যাশবোর্ড',
      layout: 'admin/layout',
      activePage: 'dashboard',
      totalDonors,
      availableDonors,
      notAvailableDonors,
      donatedBefore
    });
  } catch (err) {
    console.error('Error fetching donors:', err);
    res.status(500).send('Server error');
  }
});


// donor management routes
const Donor = require('../models/Donor');
router.get('/donors', async(req, res) => {
    // Fetch donors from DB here or pass dummy data
    try {
        const donors = await Donor.find().sort({ createdAt: -1 });  // fetch all donors from DB

        res.render('admin/donors', {
        title: 'ডোনার তালিকা',
        layout: 'admin/layout',
        activePage: 'donors',
        donors: donors  // pass donor list to template
        });
    } catch (err) {
        console.error('Error fetching donors:', err);
        res.status(500).send('Server error');
    }
});

//create new donor
router.get('/donors/create', (req, res) => {
  res.render('admin/donors/create', {
    title: 'নতুন ডোনার যোগ করুন',
    layout: 'admin/layout',
    activePage: 'donors'
  });
});

//edit donor
router.get('/donors/edit/:id', async(req, res) => {
  const donorId = req.params.id;
  const donor = await Donor.findById(donorId);
  console.log('Editing donor:', donor);
  if (!donor) {
    return res.status(404).send('Donor not found');
  }
  res.render('admin/donors/edit', {
    title: 'ডোনার সম্পাদনা',
    layout: 'admin/layout',
    activePage: 'donors',
    donor: donor
  });
});

//delete donor
router.post('/donors/delete/:id', async(req, res) => {
  const donorId = req.params.id;
  try {
    const donor = await Donor.findByIdAndDelete(donorId);
    if (!donor) {
      return res.status(404).send('Donor not found');
    }
    res.redirect('/admin/donors');
  } catch (err) {
    console.error('Error deleting donor:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
