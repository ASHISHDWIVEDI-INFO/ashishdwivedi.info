/**
 * Admin Seed Script
 * Run once: node scripts/seedAdmin.js
 * Creates the initial admin user from environment variables
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/user.model');

const seedAdmin = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role:  ${existingAdmin.role}`);
      console.log('');
      console.log('   If you want to reset the password, delete the user from');
      console.log('   MongoDB Atlas and run this script again.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name:     'Ashish Dwivedi',
      email:    process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role:     'superadmin',
    });

    console.log('');
    console.log('🎉 ================================');
    console.log('🎉  Admin user created successfully!');
    console.log('🎉 ================================');
    console.log(`   Name:  ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role:  ${admin.role}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Delete the ADMIN_EMAIL and ADMIN_PASSWORD');
    console.log('   from your .env file after first login for security.');
    console.log('');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

seedAdmin();
