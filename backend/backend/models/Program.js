const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, trim: true },
    description: { type: String },
    category: { type: String, trim: true, index: true },
    duration: { type: String },
    eligibility: { type: String },
    location: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    applicationDeadline: { type: Date },
    registrationLink: { type: String }, // admin-set Google Form/Doc URL
    image: { type: String },
    brochureUrl: { type: String },
    coordinator: { type: String, trim: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Program", programSchema);
