const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      // Remove deprecated options to prevent password exposure in logs
      // useNewUrlParser: true, // No longer needed in newer versions
      // useUnifiedTopology: true, // No longer needed in newer versions
    });

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@boutique.com' });
    
    if (existingUser) {
      console.log('Demo user already exists');
      process.exit(0);
    }

    // Create demo user
    const hashedPassword = await bcrypt.hash('password@123', 10);
    
    const demoUser = await User.create({
      email: 'admin@boutique.com',
      password: hashedPassword
    });

    console.log('Demo user created successfully:', demoUser.email);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding user:', error);
    process.exit(1);
  }
};

seedUser();