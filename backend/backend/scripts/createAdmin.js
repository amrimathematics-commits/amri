require("dotenv").config();
const readline = require("readline");
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const name = await ask("Admin name: ");
    const email = (await ask("Admin email: ")).trim().toLowerCase();
    const password = await ask("Admin password (min 8 chars): ");

    if (!name || !email || password.length < 8) {
      console.error("Invalid input. Name, email, and password (8+ chars) required.");
      process.exit(1);
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.error("An admin with this email already exists.");
      process.exit(1);
    }

    const admin = await Admin.create({ name, email, password, role: "superadmin" });
    console.log(`Admin created: ${admin.email}`);
  } catch (err) {
    console.error("Error creating admin:", err.message);
  } finally {
    rl.close();
    mongoose.disconnect();
  }
})();
