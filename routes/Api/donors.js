const express = require("express");
const router = express.Router();
const Donor = require("../../models/Donor");

// create donor
router.post("/", async (req, res) => {
  try {
    const {
      name,
      phone,
      bloodGroup,
      city,
      address,
      lastDonation,
      is_donated_before,
    } = req.body;

    if (!name) return res.status(400).json({ message: "Name required" });
    if (!phone) return res.status(400).json({ message: "Phone required" });
    if (!bloodGroup)
      return res.status(400).json({ message: "Blood group required" });

    // ডোনার ডাটা বানানো
    const donorData = {
      name,
      phone,
      bloodGroup,
      city,
      address,
      is_donated_before,
      lastDonation: lastDonation ? new Date(lastDonation) : undefined,
    };

    const donor = new Donor(donorData);
    await donor.save();

    res.status(201).json({ message: "Donor registered", donor });
  } catch (err) {
    console.error(err);
    if (err.code === 11000 && err.keyPattern?.phone) {
      return res.status(400).json({ message: "Phone already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

//update donor
// PUT /donors/:id
router.put("/:id", async (req, res) => {
  try {
    const donorId = req.params.id;
    const {
      name,
      phone,
      bloodGroup,
      city,
      address,
      lastDonation,
      is_donated_before,
    } = req.body;

    // ডোনার আছে কিনা চেক
    const donor = await Donor.findById(donorId);
    if (!donor) return res.status(404).json({ message: "Donor not found" });

    // Optional update: শুধু যেগুলো পাঠানো হয়েছে সেগুলোই আপডেট হবে
    if (name) donor.name = name;
    if (phone) donor.phone = phone;
    if (bloodGroup) donor.bloodGroup = bloodGroup;
    if (city) donor.city = city;
    if (address) donor.address = address;
    if (is_donated_before !== undefined)
      donor.is_donated_before = is_donated_before;
    if (lastDonation) donor.lastDonation = new Date(lastDonation);

    await donor.save();

    res.status(200).json({ message: "Donor updated", donor });
  } catch (err) {
    console.error(err);

    // Duplicate phone error handle
    if (err.code === 11000 && err.keyPattern?.phone) {
      return res.status(400).json({ message: "Phone already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// search donors: query params q (name/phone), bloodGroup, city, page, limit
router.get("/", async (req, res) => {
  try {
    const { q, bloodGroup, city, page = 1, limit = 20 } = req.query;
    const filters = {};

    if (q) {
      const rx = new RegExp(q, "i");
      filters.$or = [{ name: rx }, { phone: rx }, { email: rx }];
    }
    if (bloodGroup && bloodGroup !== "all") filters.bloodGroup = bloodGroup;
    if (city) filters.city = new RegExp(city, "i");

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
      const [donors, total] = await Promise.all([
      Donor.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Donor.countDocuments(filters),
    ]);

    res.json({
      donors,
      total,
      page:  parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
    // const donors = await Donor.find(filters)
    //   .sort({ createdAt: -1 })
    //   .skip(skip)
    //   .limit(parseInt(limit));

    // res.json({ donors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// admin-only: delete donor
router.delete("/:id", async (req, res) => {
  // Simple admin check: session
  if (!req.session || !req.session.isAdmin)
    return res.status(401).json({ message: "Unauthorized" });
  try {
    await Donor.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
