require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const {
  verifyEmailConnection,
} = require("./services/emailService");

const {
  startMembershipScheduler,
} = require("./services/membershipScheduler");

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  try {
    /*
    |--------------------------------------------------------------------------
    | CONNECT DATABASE
    |--------------------------------------------------------------------------
    */

    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | START SERVER
    |--------------------------------------------------------------------------
    */

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });

    /*
    |--------------------------------------------------------------------------
    | VERIFY EMAIL
    |--------------------------------------------------------------------------
    */

    try {
      await verifyEmailConnection();
    } catch (error) {
      console.error(
        "Email verification failed:",
        error.message
      );
    }

    /*
    |--------------------------------------------------------------------------
    | START MEMBERSHIP SCHEDULER
    |--------------------------------------------------------------------------
    */

    startMembershipScheduler();
  } catch (error) {
    console.error(
      "Failed to start server:",
      error.message
    );

    process.exit(1);
  }
};

startServer();