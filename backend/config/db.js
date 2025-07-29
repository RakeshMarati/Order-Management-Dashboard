const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use newer connection options to avoid deprecation warnings
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Remove deprecated options that cause warnings
      // useNewUrlParser: true, // No longer needed in newer versions
      // useUnifiedTopology: true, // No longer needed in newer versions
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
