const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    membershipType: {
      type: String,
      required: true,
      enum: [
        "Student",
        "Research Scholar",
        "Faculty Member",
        "Professional",
      ],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Membership",
  membershipSchema
);