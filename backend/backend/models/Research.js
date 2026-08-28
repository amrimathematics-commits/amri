const mongoose = require("mongoose");

const researchSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, trim: true },
    description: { type: String },
    category: { type: String, trim: true, index: true },
    authors: [{ type: String, trim: true }],
    department: { type: String, trim: true },
    researchArea: { type: String, trim: true },
    publicationDate: { type: Date },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    image: { type: String },
    documentUrl: { type: String },
    externalUrl: { type: String },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

researchSchema.index({ title: "text", shortDescription: "text" });

module.exports = mongoose.model("Research", researchSchema);
