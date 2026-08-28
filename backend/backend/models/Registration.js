const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["event", "program"],
      required: true,
    },

    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    contentTitle: {
      type: String,
      required: true,
      trim: true,
    },

    registrationLink: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Registration",
  registrationSchema
);