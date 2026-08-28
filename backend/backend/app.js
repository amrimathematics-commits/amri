require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const errorHandler = require("./middleware/errorHandler");

const membershipRoutes = require("./routes/membership");
const authRoutes = require("./routes/authRoutes");
const researchRoutes = require("./routes/researchRoutes");
const eventRoutes = require("./routes/eventRoutes");
const innovationRoutes = require("./routes/innovationRoutes");
const programRoutes = require("./routes/programRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const registrationRoutes = require("./routes/registrations");

const app = express();

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.json({
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

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

module.exports = app;