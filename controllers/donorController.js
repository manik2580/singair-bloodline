const Donor = require('../models/Donor');


// List all donors with pagination and filtering
exports.listDonors = async (req, res) => {
  try {
    // Query params
    const search = req.query.search ? req.query.search.trim() : '';
    const bloodGroup = req.query.bloodGroup || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 20; // donors per page

    // Build MongoDB filter
    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }, // search by name
        { phone: { $regex: search, $options: 'i' } } // search by phone
      ];
    }
    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    // Count total documents for pagination
    const totalDonors = await Donor.countDocuments(filter);

    // Fetch donors with pagination
    const donors = await Donor.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Render the template
    res.render('admin/donors', {
      title: 'ডোনার তালিকা',
      layout: 'layouts/dashboard.ejs',
      activePage: 'donors',
      donors,
      currentPage: page,
      totalPages: Math.ceil(totalDonors / limit),
      search,
      bloodGroup,
      limit
    });

  } catch (err) {
    console.error('Error fetching donors:', err);
    res.status(500).send('Server error');
  }
}

// Get details of a specific donor
exports.getDonorDetails = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).render('errors/404-dashboard', {
        title: 'ডোনার পাওয়া যায়নি',
        layout: 'layouts/dashboard.ejs'
      });
    }

    res.render('admin/donors/show', {
      title: donor.name + ' - ডোনার বিবরণ',
      layout: 'layouts/dashboard.ejs',
       activePage: 'donors',
      donor
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

// Render form to create a new donor
exports.createDonorForm = (req, res) => {
  res.render('admin/donors/create.ejs', {
    title: 'নতুন ডোনার যোগ করুন',
    activePage: 'donors',
    layout: 'layouts/dashboard.ejs',
  });
}

// Render form to edit an existing donor
exports.editDonorForm = async(req, res) => {
  const donorId = req.params.id;
  const donor = await Donor.findById(donorId);
  console.log('Editing donor:', donor);
  if (!donor) {
    return res.status(404).send('Donor not found');
  }
  res.render('admin/donors/edit', {
    title: 'ডোনার সম্পাদনা',
    activePage: 'donors',
    layout: 'layouts/dashboard.ejs',
    donor: donor
  });
}

// Delete a donor
exports.deleteDonor = async(req, res) => {
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
}

// Verify a donor
exports.verifyDonor = async(req, res) => {
  const donorId = req.params.id;
  try {
    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).send('Donor not found');
    }
    donor.is_verified = !donor.is_verified;
    await donor.save();
    res.redirect(`/admin/donors/${donorId}`);
  } catch (err) {
    console.error('Error verifying donor:', err);
    res.status(500).send('Server error');
  }
}

