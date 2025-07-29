const mongoose = require('mongoose');

// Suppress deprecation warnings to prevent password exposure in logs
process.env.NODE_NO_WARNINGS = '1';

const connectDB = async () => {
  try {
    // Add required options to prevent deprecation warnings and URL logging
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Additional options to prevent warnings
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
