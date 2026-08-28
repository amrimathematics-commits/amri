const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // Reuse existing connection when running on Vercel
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    return conn.connection;
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);

    // IMPORTANT:
    // Do NOT use process.exit() on Vercel/serverless.
    throw err;
  }
};

module.exports = connectDB;