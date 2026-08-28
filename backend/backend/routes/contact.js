const express = require("express");

const { sendContactEmail } = require("../services/emailService");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| POST /api/contact
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      email,
      message,
    } = req.body;

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    // --------------------------------------------------
    // SEND CONTACT EMAIL
    // --------------------------------------------------

    await sendContactEmail({
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
    });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (err) {
    console.error("Contact form error:", err);
    next(err);
  }
});

module.exports = router;