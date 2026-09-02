const mongoose = require("mongoose");

const membershipSettingsSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | BANK DETAILS
    |--------------------------------------------------------------------------
    */

    bankName: {
      type: String,
      default: "",
      trim: true,
    },

    accountName: {
      type: String,
      default: "",
      trim: true,
    },

    accountNumber: {
      type: String,
      default: "",
      trim: true,
    },

    ifscCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    branch: {
      type: String,
      default: "",
      trim: true,
    },

    upiId: {
      type: String,
      default: "",
      trim: true,
    },

    paymentInstructions: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MembershipSettings",
  membershipSettingsSchema
);