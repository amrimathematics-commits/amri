require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const errorHandler = require("./middleware/errorHandler");

const renewalRoutes = require("./routes/renewalRoutes");
const membershipRenewalAdminRoutes = require("./routes/membershipRenewalAdmin");
const membershipRenewalRoutes = require("./routes/membershipRenewalRoutes");

const membershipRoutes = require("./routes/membership");
const contactRoutes = require("./routes/contact");

const authRoutes = require("./routes/authRoutes");
const researchRoutes = require("./routes/researchRoutes");
const eventRoutes = require("./routes/eventRoutes");
const innovationRoutes = require("./routes/innovationRoutes");
const programRoutes = require("./routes/programRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const registrationRoutes = require("./routes/registrations");

const membershipUploadRoutes = require("./routes/membershipUploadRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(helmet());

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  "https://amri-rho.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Add CLIENT_URL if it exists
if (process.env.CLIENT_URL) {
  const clientUrl = process.env.CLIENT_URL.trim().replace(/\/$/, "");

  if (!allowedOrigins.includes(clientUrl)) {
    allowedOrigins.push(clientUrl);
  }
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    // Example: Postman, server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = origin.trim().replace(/\/$/, "");

    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    console.log("CORS blocked origin:", origin);

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};

// Main CORS middleware
app.use(cors(corsOptions));

// Explicit preflight handling
app.options(/.*/, cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Body Parser
|--------------------------------------------------------------------------
*/

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AMRI API is running",
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

app.use("/api/research", researchRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/innovations", innovationRoutes);

app.use("/api/programs", programRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/registrations", registrationRoutes);

app.use("/api/membership", membershipRoutes);

app.use("/api/contact", contactRoutes);

app.use(
  "/api/admin/membership-renewals",
  membershipRenewalRoutes
);

app.use(
  "/api/membership-upload",
  membershipUploadRoutes
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

app.use(
  "/api/renewal",
  renewalRoutes
);

app.use(
  "/api/admin/membership-renewals",
  membershipRenewalAdminRoutes
);

module.exports = app;