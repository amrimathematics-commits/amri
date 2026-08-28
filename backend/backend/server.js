require("dotenv").config();

console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASSWORD:",
  process.env.EMAIL_PASSWORD ? "LOADED" : "MISSING"
);
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const contactRoutes = require("./routes/contact");

const membershipRoutes = require("./routes/membership");

const authRoutes = require("./routes/authRoutes");
const researchRoutes = require("./routes/researchRoutes");
const eventRoutes = require("./routes/eventRoutes");
const innovationRoutes = require("./routes/innovationRoutes");
const programRoutes = require("./routes/programRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const uploadRoutes = require('./routes/uploadRoutes')

const registrationRoutes = require("./routes/registrations");


const { verifyEmailConnection } = require("./services/emailService");
connectDB();
verifyEmailConnection();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "AMRI API is running" });
});


app.use("/api/auth", authRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/innovations", innovationRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/membership", membershipRoutes);


app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;