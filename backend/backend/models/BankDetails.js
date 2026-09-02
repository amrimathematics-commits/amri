const mongoose = require("mongoose");

const bankDetailsSchema = new mongoose.Schema(
  {
    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    ifsc: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    branch: {
      type: String,
      required: true,
      trim: true,
    },

    upi: {
      type: String,
      trim: true,
      default: "",
    },

    updatedBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "BankDetails",
  bankDetailsSchema
);