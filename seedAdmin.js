require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log('Admin exists:', username);
    process.exit(0);
  }
  const hash = await bcrypt.hash(password, 10);
  const admin = new Admin({ username, passwordHash: hash });
  await admin.save();
  console.log('Admin created:', username);
  process.exit(0);
}
seed().catch(err => { console.error(err); process.exit(1); });
