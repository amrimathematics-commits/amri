const express = require("express");
const router = express.Router();

const { sendContactEmail } = require("../services/emailService");

router.post("/", async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    await sendContactEmail({
      name,
      email,
      message,
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact form error:", error);

    next(error);
  }
});

module.exports = router;