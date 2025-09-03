const mongoose = require('mongoose');

const DonorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true, unique: true },
  bloodGroup: { type: String, trim: true },
  city: { type: String, trim: true },
  address: { type: String, trim: true },
  is_donated_before: { type: Boolean, default: false },
  lastDonation: { type: Date },
  is_verified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Donor', DonorSchema);
