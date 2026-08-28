const express = require("express");
const Membership = require("../models/Membership");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Submit membership application
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      email,
      membershipType,
    } = req.body;

    if (!name || !email || !membershipType) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and membership type are required.",
      });
    }

    const membership = await Membership.create({
      name,
      email,
      membershipType,
    });

    return res.status(201).json({
      success: true,
      message:
        "Membership application submitted successfully.",
      data: membership,
    });
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| Get membership applications
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res, next) => {
  try {
    const memberships = await Membership.find()
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: memberships,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;