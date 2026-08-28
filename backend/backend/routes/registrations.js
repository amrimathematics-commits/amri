const express = require("express");

const Event = require("../models/Event");
const Program = require("../models/Program");
const Registration = require("../models/Registration");

const { sendRegistrationEmail } = require("../services/emailService");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      email,
      type,
      id,
    } = req.body;

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!name || !email || !type || !id) {
      return res.status(400).json({
        success: false,
        message: "Name, email, type and id are required.",
      });
    }

    if (!["event", "program"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration type.",
      });
    }

    // --------------------------------------------------
    // FIND EVENT / PROGRAM
    // --------------------------------------------------

    const Model = type === "event"
      ? Event
      : Program;

    const item = await Model.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${
          type === "event"
            ? "Event"
            : "Program"
        } not found.`,
      });
    }

    // --------------------------------------------------
    // CHECK REGISTRATION LINK
    // --------------------------------------------------

    if (
      !item.registrationLink ||
      !item.registrationLink.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Registration link has not been configured for this event/program.",
      });
    }

    // --------------------------------------------------
    // SAVE REGISTRATION REQUEST
    // --------------------------------------------------

    const registration = await Registration.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      type,
      contentId: item._id,
      contentTitle: item.title,
      registrationLink: item.registrationLink.trim(),
    });

    // --------------------------------------------------
    // SEND EMAIL
    // --------------------------------------------------

    try {
      await sendRegistrationEmail({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        title: item.title,
        type,
        registrationLink: item.registrationLink.trim(),
      });
    } catch (emailError) {
      console.error(
        "Registration email failed:",
        emailError
      );

      return res.status(500).json({
        success: false,
        message:
          "Your registration request was saved, but we could not send the email. Please try again.",
      });
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Registration link sent successfully.",
      registration: {
        id: registration._id,
        name: registration.name,
        email: registration.email,
        title: registration.contentTitle,
      },
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;