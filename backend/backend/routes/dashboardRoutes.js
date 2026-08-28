const express = require("express");
const Research = require("../models/Research");
const Event = require("../models/Event");
const Innovation = require("../models/Innovation");
const Program = require("../models/Program");
const { protect } = require("../middleware/auth");
const { success } = require("../utils/apiResponse");

const router = express.Router();

router.get("/stats", protect, async (req, res, next) => {
  try {
    const [totalResearch, totalEvents, totalInnovations, totalPrograms] =
      await Promise.all([
        Research.countDocuments(),
        Event.countDocuments(),
        Innovation.countDocuments(),
        Program.countDocuments(),
      ]);

    const recent = await Promise.all([
      Research.find().sort("-updatedAt").limit(5).select("title status updatedAt"),
      Event.find().sort("-updatedAt").limit(5).select("title status updatedAt"),
      Innovation.find().sort("-updatedAt").limit(5).select("title status updatedAt"),
      Program.find().sort("-updatedAt").limit(5).select("title status updatedAt"),
    ]);

    return success(res, 200, "Dashboard stats fetched", {
      totals: { totalResearch, totalEvents, totalInnovations, totalPrograms },
      recent: {
        research: recent[0],
        events: recent[1],
        innovations: recent[2],
        programs: recent[3],
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
