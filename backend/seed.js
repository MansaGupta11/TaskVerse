require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'ADMIN') {
      existing.role = 'ADMIN';
      await existing.save();
      console.log('Promoted existing user to ADMIN:', email);
    } else {
      console.log('Admin already exists:', email);
    }
    process.exit(0);
  }
  const hashed = await bcrypt.hash(password, 12);
  await User.create({ name: 'Admin', email, password: hashed, role: 'ADMIN' });
  console.log('Admin created:', email);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
