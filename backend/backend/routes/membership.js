const express = require("express");
const router = express.Router();

const { sendMembershipEmail } = require("../services/emailService");

router.post("/", async (req, res, next) => {
  try {
    const { name, email, membershipType } = req.body;

    if (!name || !email || !membershipType) {
      return res.status(400).json({
        success: false,
        message: "Name, email and membership type are required",
      });
    }

    await sendMembershipEmail({
      name,
      email,
      membershipType,
    });

    res.status(200).json({
      success: true,
      message: "Membership application submitted successfully",
    });
  } catch (error) {
    console.error("Membership form error:", error);
    next(error);
  }
});

module.exports = router;