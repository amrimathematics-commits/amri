const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, trim: true },
    description: { type: String },
    eventDate: { type: Date, required: true, index: true },
    startTime: { type: String },
    endTime: { type: String },
    location: { type: String, trim: true },
    organizer: { type: String, trim: true },
    category: { type: String, trim: true, index: true },
    speaker: { type: String, trim: true },
    registrationLink: { type: String }, // admin-set Google Form/Doc URL
    image: { type: String },
    gallery: [{ type: String }],
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

eventSchema.virtual("timing").get(function () {
  const now = new Date();

  if (!this.eventDate) {
    return "unknown";
  }

  if (this.eventDate > now) {
    return "upcoming";
  }

  if (this.eventDate.toDateString() === now.toDateString()) {
    return "ongoing";
  }

  return "past";
});

module.exports = mongoose.model("Event", eventSchema);
