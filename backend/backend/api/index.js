const app = require("../app");
const connectDB = require("../config/db");

let dbPromise = null;

module.exports = async (req, res) => {
  try {
    // Connect to MongoDB once per Vercel serverless instance
    if (!dbPromise) {
      dbPromise = connectDB();
    }

    await dbPromise;

    // Send the request to Express
    return app(req, res);

  } catch (error) {
    console.error("Vercel server error:", error);

    // Allow the next request to retry the DB connection
    dbPromise = null;

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Server initialization failed",
      });
    }
  }
};