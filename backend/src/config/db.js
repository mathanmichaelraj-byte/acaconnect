const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri && process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is required in production');
    }
    await mongoose.connect(uri || "mongodb://localhost:27017/college_events");
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
