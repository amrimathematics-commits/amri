const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | APPLICANT INFORMATION
    |--------------------------------------------------------------------------
    */

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

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    applicantType: {
      type: String,
      required: true,
      enum: [
        "Student",
        "Research Scholar",
        "Faculty Member",
        "Professional",
      ],
    },

    /*
    |--------------------------------------------------------------------------
    | MEMBERSHIP
    |--------------------------------------------------------------------------
    */

    membershipType: {
      type: String,
      required: true,
      enum: [
        "Yearly",
        "Bi-Yearly",
        "Lifetime",
      ],
    },

    membershipDuration: {
      type: String,
      required: true,
      enum: [
        "1 Year",
        "2 Years",
        "Lifetime",
      ],
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT RECEIPT
    |--------------------------------------------------------------------------
    */

    receipt: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
      },

      fileName: {
        type: String,
        default: "",
      },

      uploadedAt: {
        type: Date,
        default: null,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | APPLICATION STATUS
    |--------------------------------------------------------------------------
    |
    | submitted
    | bank_details_sent
    | payment_submitted
    | payment_received
    | member
    | expired
    | stopped
    |
    |--------------------------------------------------------------------------
    */

      status: {
        type: String,

        enum: [
          "submitted",
          "bank_details_sent",
          "payment_submitted",
          "payment_received",
          "member",
          "stopped",
          "expired",
        ],

        default: "submitted",

        index: true,
      },

    /*
    |--------------------------------------------------------------------------
    | BANK DETAILS
    |--------------------------------------------------------------------------
    */

    bankDetailsSent: {
      type: Boolean,
      default: false,
    },

    bankDetailsSentAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | BANK DETAILS SNAPSHOT
    |--------------------------------------------------------------------------
    |
    | Stores the exact bank details that were sent
    | to this applicant.
    |
    */

    bankDetailsSnapshot: {
      accountName: {
        type: String,
        default: "",
      },

      bankName: {
        type: String,
        default: "",
      },

      accountNumber: {
        type: String,
        default: "",
      },

      ifsc: {
        type: String,
        default: "",
      },

      branch: {
        type: String,
        default: "",
      },

      upi: {
        type: String,
        default: "",
      },

      paymentInstructions: {
        type: String,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT
    |--------------------------------------------------------------------------
    */

    paymentReceived: {
      type: Boolean,
      default: false,
    },

    // paymentReceivedAt: {
    //   type: Date,
    //   default: null,
    // },

    /*
    |--------------------------------------------------------------------------
    | MEMBERSHIP LIFECYCLE
    |--------------------------------------------------------------------------
    */

    membershipStartDate: {
      type: Date,
      default: null,
    },

    membershipExpiryDate: {
      type: Date,
      default: null,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RENEWAL
    |--------------------------------------------------------------------------
    */

    renewalId: {
      type: String,
      // default: null,

      unique: true,

      sparse: true,

      trim: true,
    },

    renewalReminderSent: {
      type: Boolean,
      default: false,
    },

    renewalReminderSentAt: {
      type: Date,
      default: null,
    },

    renewalPaymentSubmittedAt: {
      type: Date,
      default: null,
    },

    renewalPaymentReceivedAt: {
      type: Date,
      default: null,
    },

    previousMembershipExpiryDate: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | MEMBER
    |--------------------------------------------------------------------------
    */

    isMember: {
      type: Boolean,
      default: false,
      index: true,
    },

    memberId: {
      type: String,
      default: "",
      trim: true,
    },

    becameMemberAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | MEMBERSHIP STOPPED
    |--------------------------------------------------------------------------
    */

    membershipStoppedAt: {
      type: Date,
      default: null,
    },

    membershipStoppedReason: {
      type: String,
      default: null,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | ADMIN INFORMATION
    |--------------------------------------------------------------------------
    */

    lastActionBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Admin",

      default: null,
    },
  },

  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

module.exports = mongoose.model(
  "Membership",
  membershipSchema
);