const mongoose = require("mongoose");

const innovationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, trim: true },
    description: { type: String },
    category: { type: String, trim: true, index: true },
    technology: [{ type: String, trim: true }],
    innovators: [{ type: String, trim: true }],
    department: { type: String, trim: true },
    problemStatement: { type: String },
    solution: { type: String },
    impact: { type: String },
    image: { type: String },
    gallery: [{ type: String }],
    videoUrl: { type: String },
    externalUrl: { type: String },
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

module.exports = mongoose.model("Innovation", innovationSchema);
