const express = require("express");

const router = express.Router();

const Membership = require("../models/Membership");
const BankDetails = require("../models/BankDetails");

const { protect } = require("../middleware/auth");

const emailService = require("../services/emailService");

const {
  sendMembershipApplicationEmail,
  sendBankDetailsEmail,
  sendPaymentReceivedEmail,
  sendMembershipConfirmationEmail,
} = emailService;

/*
|--------------------------------------------------------------------------
| MEMBERSHIP PLANS
|--------------------------------------------------------------------------
*/

const membershipPlans = {
  Yearly: {
    amount: 750,
    duration: "1 Year",
    years: 1,
  },

  "Bi-Yearly": {
    amount: 1200,
    duration: "2 Years",
    years: 2,
  },

  Lifetime: {
    amount: 5000,
    duration: "Lifetime",
    years: null,
  },
};

/*
|--------------------------------------------------------------------------
| GENERATE MEMBER ID
|--------------------------------------------------------------------------
*/

async function generateMemberId() {
  const year = new Date().getFullYear();

  const memberCount =
    await Membership.countDocuments({
      isMember: true,
    });

  const memberNumber =
    String(memberCount + 1).padStart(
      4,
      "0"
    );

  return `AMRI-${year}-${memberNumber}`;
}

/*
|--------------------------------------------------------------------------
| GENERATE RENEWAL ID
|--------------------------------------------------------------------------
*/

async function generateRenewalId() {
  const year = new Date().getFullYear();

  let renewalId;
  let exists = true;

  while (exists) {
    const randomNumber =
      Math.floor(
        100000 +
          Math.random() * 900000
      );

    renewalId =
      `AMRI-REN-${year}-${randomNumber}`;

    exists =
      await Membership.exists({
        renewalId,
      });
  }

  return renewalId;
}

/*
|--------------------------------------------------------------------------
| CALCULATE MEMBERSHIP EXPIRY
|--------------------------------------------------------------------------
*/

function calculateMembershipExpiry(
  startDate,
  membershipType
) {
  const plan =
    membershipPlans[
      membershipType
    ];

  if (!plan) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | LIFETIME
  |--------------------------------------------------------------------------
  */

  if (plan.years === null) {
    return null;
  }

  const expiryDate =
    new Date(startDate);

  expiryDate.setFullYear(
    expiryDate.getFullYear() +
      plan.years
  );

  return expiryDate;
}

/*
|--------------------------------------------------------------------------
| CHECK MEMBERSHIP EXPIRY
|--------------------------------------------------------------------------
*/

async function checkMembershipExpiry(
  membership
) {
  if (!membership) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | LIFETIME NEVER EXPIRES
  |--------------------------------------------------------------------------
  */

  if (
    membership.membershipType ===
    "Lifetime"
  ) {
    return membership;
  }

  /*
  |--------------------------------------------------------------------------
  | NO EXPIRY DATE
  |--------------------------------------------------------------------------
  */

  if (
    !membership.membershipExpiryDate
  ) {
    return membership;
  }

  /*
  |--------------------------------------------------------------------------
  | ONLY ACTIVE MEMBERS CAN EXPIRE
  |--------------------------------------------------------------------------
  */

  if (!membership.isMember) {
    return membership;
  }

  const now = new Date();

  const expiryDate =
    new Date(
      membership.membershipExpiryDate
    );

  if (
    expiryDate <= now
  ) {
    membership.isMember =
      false;

    membership.status =
      "expired";

    await membership.save();
  }

  return membership;
}

/*
|--------------------------------------------------------------------------
| CHECK ALL ACTIVE MEMBERS
|--------------------------------------------------------------------------
*/

async function expireMemberships() {
  try {
    const now = new Date();

    const memberships =
      await Membership.find({
        isMember: true,

        membershipType: {
          $ne: "Lifetime",
        },

        membershipExpiryDate: {
          $ne: null,
          $lte: now,
        },
      });

    for (
      const membership of memberships
    ) {
      membership.isMember =
        false;

      membership.status =
        "expired";

      await membership.save();
    }

    if (
      memberships.length > 0
    ) {
      console.log(
        `Automatically expired ${memberships.length} membership(s).`
      );
    }
  } catch (error) {
    console.error(
      "Automatic membership expiry check failed:",
      error
    );
  }
}

/*
|--------------------------------------------------------------------------
| CREATE MEMBERSHIP APPLICATION
|--------------------------------------------------------------------------
| POST /api/membership
| Public
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        address,
        applicantType,
        membershipType,
      } = req.body;

      if (
        !name ||
        !email ||
        !phone ||
        !address ||
        !applicantType ||
        !membershipType
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Please fill all required fields.",
        });
      }

      const plan =
        membershipPlans[
          membershipType
        ];

      if (!plan) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid membership type.",
        });
      }

      const membership =
        await Membership.create({
          name:
            String(name).trim(),

          email:
            String(email)
              .trim()
              .toLowerCase(),

          phone:
            String(phone).trim(),

          address:
            String(address).trim(),

          applicantType,

          membershipType,

          amount:
            plan.amount,

          membershipDuration:
            plan.duration,

          status:
            "submitted",

          isMember:
            false,

          bankDetailsSent:
            false,

          paymentReceived:
            false,

          paymentReceivedAt:
            null,

          membershipStartDate:
            null,

          membershipExpiryDate:
            null,

          renewalId:
            null,

          renewalReminderSent:
            false,

          renewalReminderSentAt:
            null,

          membershipStoppedAt:
            null,

          membershipStoppedReason:
            null,
        });

      /*
      |--------------------------------------------------------------------------
      | SEND APPLICATION EMAIL
      |--------------------------------------------------------------------------
      */

      try {
        if (
          typeof sendMembershipApplicationEmail ===
          "function"
        ) {
          await sendMembershipApplicationEmail({
            membership,
          });
        }
      } catch (emailError) {
        console.error(
          "Membership application email failed:",
          emailError
        );
      }

      return res.status(201).json({
        success: true,

        message:
          "Membership application submitted successfully. AMRI will review your application and send payment instructions if approved.",

        data: membership,
      });
    } catch (error) {
      console.error(
        "Create membership error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to submit membership application.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET ALL MEMBERSHIP APPLICATIONS
|--------------------------------------------------------------------------
| GET /api/membership
| Admin
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  async (req, res) => {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTOMATIC EXPIRY CHECK
      |--------------------------------------------------------------------------
      */

      await expireMemberships();

      const memberships =
        await Membership.find()
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,

        data: memberships,
      });
    } catch (error) {
      console.error(
        "Get memberships error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to fetch membership applications.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET BANK DETAILS
|--------------------------------------------------------------------------
| GET /api/membership/bank-details
| Admin
|--------------------------------------------------------------------------
*/

router.get(
  "/bank-details",
  protect,
  async (req, res) => {
    try {
      const bankDetails =
        await BankDetails.findOne()
          .lean();

      return res.status(200).json({
        success: true,

        data:
          bankDetails || null,
      });
    } catch (error) {
      console.error(
        "Get bank details error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to fetch bank details.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| UPDATE BANK DETAILS
|--------------------------------------------------------------------------
| PUT /api/membership/bank-details
| Admin
|--------------------------------------------------------------------------
*/

router.put(
  "/bank-details",
  protect,
  async (req, res) => {
    try {
      const accountName =
        String(
          req.body.accountName ??
            req.body.account_name ??
            req.body.accountHolderName ??
            req.body.account_holder_name ??
            ""
        ).trim();

      const bankName =
        String(
          req.body.bankName ??
            req.body.bank_name ??
            ""
        ).trim();

      const accountNumber =
        String(
          req.body.accountNumber ??
            req.body.account_number ??
            ""
        ).trim();

      const ifsc =
        String(
          req.body.ifscCode ??
            req.body.ifsc ??
            req.body.ifsc_code ??
            ""
        )
          .trim()
          .toUpperCase();

      const branch =
        String(
          req.body.branch ??
            req.body.branchName ??
            req.body.branch_name ??
            ""
        ).trim();

      const upi =
        String(
          req.body.upiId ??
            req.body.upi ??
            req.body.upi_id ??
            ""
        ).trim();

      const paymentInstructions =
        String(
          req.body.paymentInstructions ??
            req.body.payment_instructions ??
            ""
        ).trim();

      if (
        !accountName ||
        !bankName ||
        !accountNumber ||
        !ifsc ||
        !branch
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Account name, bank name, account number, IFSC and branch are required.",
        });
      }

      let bankDetails =
        await BankDetails.findOne();

      if (!bankDetails) {
        bankDetails =
          new BankDetails();
      }

      bankDetails.accountName =
        accountName;

      bankDetails.bankName =
        bankName;

      bankDetails.accountNumber =
        accountNumber;

      bankDetails.ifsc =
        ifsc;

      bankDetails.branch =
        branch;

      bankDetails.upi =
        upi;

      bankDetails.paymentInstructions =
        paymentInstructions;

      await bankDetails.save();

      return res.status(200).json({
        success: true,

        message:
          "Bank details saved successfully.",

        data: bankDetails,
      });
    } catch (error) {
      console.error(
        "Update bank details error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to save bank details.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET PUBLIC MEMBERSHIP
|--------------------------------------------------------------------------
| GET /api/membership/public/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/public/:id",
  async (req, res) => {
    try {
      await expireMemberships();

      const membership =
        await Membership.findById(
          req.params.id
        ).lean();

      if (!membership) {
        return res.status(404).json({
          success: false,

          message:
            "Membership application not found.",
        });
      }

      return res.status(200).json({
        success: true,

        data: {
          _id:
            membership._id,

          name:
            membership.name,

          email:
            membership.email,

          phone:
            membership.phone,

          membershipType:
            membership.membershipType,

          membershipDuration:
            membership.membershipDuration,

          amount:
            membership.amount,

          applicantType:
            membership.applicantType,

          status:
            membership.status,

          isMember:
            membership.isMember,

          memberId:
            membership.memberId,

          membershipStartDate:
            membership.membershipStartDate,

          membershipExpiryDate:
            membership.membershipExpiryDate,

          renewalId:
            membership.renewalId,

          renewalPaymentSubmittedAt:
            membership.renewalPaymentSubmittedAt,

          bankDetailsSnapshot:
            membership.bankDetailsSnapshot,
        },
      });
    } catch (error) {
      console.error(
        "Get public membership error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to fetch membership application.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| SEND BANK DETAILS
|--------------------------------------------------------------------------
| POST /api/membership/:id/send-bank-details
| Admin
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/send-bank-details",
  protect,
  async (req, res) => {
    try {
      const membership =
        await Membership.findById(
          req.params.id
        );

      if (!membership) {
        return res.status(404).json({
          success: false,

          message:
            "Membership application not found.",
        });
      }

      if (
        membership.status !==
        "submitted"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Bank details can only be sent for a new membership application.",
        });
      }

      const bankDetails =
        await BankDetails.findOne();

      if (!bankDetails) {
        return res.status(400).json({
          success: false,

          message:
            "Bank details have not been configured in the admin panel.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | SEND EMAIL FIRST
      |--------------------------------------------------------------------------
      */

      await sendBankDetailsEmail({
        membership,

        bankDetails: {
          accountName:
            bankDetails.accountName ||
            "",

          bankName:
            bankDetails.bankName ||
            "",

          accountNumber:
            bankDetails.accountNumber ||
            "",

          ifsc:
            bankDetails.ifsc ||
            "",

          branch:
            bankDetails.branch ||
            "",

          upiId:
            bankDetails.upi ||
            bankDetails.upiId ||
            "",

          paymentInstructions:
            bankDetails.paymentInstructions ||
            "",
        },
      });

      /*
      |--------------------------------------------------------------------------
      | UPDATE STATUS
      |--------------------------------------------------------------------------
      */

      membership.status =
        "bank_details_sent";

      membership.bankDetailsSent =
        true;

      membership.bankDetailsSentAt =
        new Date();

      /*
      |--------------------------------------------------------------------------
      | SNAPSHOT
      |--------------------------------------------------------------------------
      */

      membership.bankDetailsSnapshot = {
        accountName:
          bankDetails.accountName ||
          "",

        bankName:
          bankDetails.bankName ||
          "",

        accountNumber:
          bankDetails.accountNumber ||
          "",

        ifsc:
          bankDetails.ifsc ||
          "",

        branch:
          bankDetails.branch ||
          "",

        upi:
          bankDetails.upi ||
          bankDetails.upiId ||
          "",
      };

      await membership.save();

      return res.status(200).json({
        success: true,

        message:
          "Bank details sent successfully.",

        data: membership,
      });
    } catch (error) {
      console.error(
        "Send bank details error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to send bank details.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| MARK PAYMENT RECEIVED
|--------------------------------------------------------------------------
| PATCH /api/membership/:id/payment-received
| Admin
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/payment-received",
  protect,
  async (req, res) => {
    try {
      const membership =
        await Membership.findById(
          req.params.id
        );

      if (!membership) {
        return res.status(404).json({
          success: false,

          message:
            "Membership application not found.",
        });
      }

      if (
        membership.status ===
          "member" ||
        membership.isMember
      ) {
        return res.status(400).json({
          success: false,

          message:
            "This applicant is already a member.",
        });
      }

      if (
        !membership.bankDetailsSent
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Bank details must be sent before confirming payment.",
        });
      }

      if (
        !membership.receipt?.url
      ) {
        return res.status(400).json({
          success: false,

          message:
            "A payment receipt is required before confirming payment.",
        });
      }

      if (
        membership.status !==
        "payment_submitted"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Payment has not been submitted by the applicant yet.",
        });
      }

      const paymentDate =
        new Date();

      const expiryDate =
        calculateMembershipExpiry(
          paymentDate,
          membership.membershipType
        );

      membership.status =
        "payment_received";

      membership.paymentReceived =
        true;

      membership.paymentReceivedAt =
        paymentDate;

      membership.membershipStartDate =
        paymentDate;

      membership.membershipExpiryDate =
        expiryDate;

      if (
        membership.membershipType !==
          "Lifetime" &&
        !membership.renewalId
      ) {
        membership.renewalId =
          await generateRenewalId();
      }

      membership.renewalReminderSent =
        false;

      membership.renewalReminderSentAt =
        null;

      await membership.save();

      try {
        await sendPaymentReceivedEmail({
          membership,
        });
      } catch (emailError) {
        console.error(
          "Payment received email failed:",
          emailError
        );
      }

      return res.status(200).json({
        success: true,

        message:
          "Payment verified and membership period started.",

        data: membership,
      });
    } catch (error) {
      console.error(
        "Payment received error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to mark payment as received.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| MAKE MEMBER
|--------------------------------------------------------------------------
| PATCH /api/membership/:id/make-member
| Admin
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/make-member",
  protect,
  async (req, res) => {
    try {
      const membership =
        await Membership.findById(
          req.params.id
        );

      if (!membership) {
        return res.status(404).json({
          success: false,

          message:
            "Membership application not found.",
        });
      }

      if (
        membership.isMember
      ) {
        return res.status(400).json({
          success: false,

          message:
            "This applicant is already a member.",
        });
      }

      if (
        membership.status !==
          "payment_received" ||
        !membership.paymentReceived
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Payment must be verified before activating membership.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PAYMENT DATE
      |--------------------------------------------------------------------------
      */

      const membershipStartDate =
        membership.membershipStartDate ||
        membership.paymentReceivedAt ||
        new Date();

      const membershipExpiryDate =
        membership.membershipExpiryDate ||
        calculateMembershipExpiry(
          membershipStartDate,
          membership.membershipType
        );

      /*
      |--------------------------------------------------------------------------
      | MEMBER ID
      |--------------------------------------------------------------------------
      */

      if (!membership.memberId) {
        membership.memberId =
          await generateMemberId();
      }

      /*
      |--------------------------------------------------------------------------
      | RENEWAL ID
      |--------------------------------------------------------------------------
      */

      if (
        membership.membershipType !==
          "Lifetime" &&
        !membership.renewalId
      ) {
        membership.renewalId =
          await generateRenewalId();
      }

      /*
      |--------------------------------------------------------------------------
      | ACTIVATE
      |--------------------------------------------------------------------------
      */

      membership.status =
        "member";

      membership.isMember =
        true;

      membership.becameMemberAt =
        membership.becameMemberAt ||
        new Date();

      membership.membershipStartDate =
        membershipStartDate;

      membership.membershipExpiryDate =
        membershipExpiryDate;

      membership.renewalReminderSent =
        false;

      membership.renewalReminderSentAt =
        null;

      membership.membershipStoppedAt =
        null;

      membership.membershipStoppedReason =
        null;

      await membership.save();

      /*
      |--------------------------------------------------------------------------
      | SEND ACTIVATION EMAIL
      |--------------------------------------------------------------------------
      */

      try {
        await sendMembershipConfirmationEmail({
          membership,
        });
      } catch (emailError) {
        console.error(
          "Final membership email failed:",
          emailError
        );
      }

      return res.status(200).json({
        success: true,

        message:
          "Applicant is now an AMRI member.",

        data: membership,
      });
    } catch (error) {
      console.error(
        "Make member error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to activate membership.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| STOP MEMBERSHIP
|--------------------------------------------------------------------------
| PATCH /api/membership/:id/stop
| Admin
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/stop",
  protect,
  async (req, res) => {
    try {
      const membership =
        await Membership.findById(
          req.params.id
        );

      if (!membership) {
        return res.status(404).json({
          success: false,

          message:
            "Membership not found.",
        });
      }

      if (
        !membership.isMember ||
        membership.status !==
          "member"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "This applicant does not have an active membership.",
        });
      }

      const reason =
        String(
          req.body?.reason || ""
        ).trim() ||
        "Membership stopped by administrator.";

      const stoppedAt =
        new Date();

      /*
      |--------------------------------------------------------------------------
      | SAVE PREVIOUS EXPIRY
      |--------------------------------------------------------------------------
      */

      membership.previousMembershipExpiryDate =
        membership.membershipExpiryDate;

      /*
      |--------------------------------------------------------------------------
      | STOP MEMBERSHIP
      |--------------------------------------------------------------------------
      */

      membership.status =
        "stopped";

      membership.isMember =
        false;

      membership.membershipStoppedAt =
        stoppedAt;

      membership.membershipStoppedReason =
        reason;

      /*
      |--------------------------------------------------------------------------
      | DO NOT DELETE MEMBER ID
      |--------------------------------------------------------------------------
      |
      | Keeping the member ID means the same member
      | can be reactivated later.
      |
      |--------------------------------------------------------------------------
      */

      /*
      |--------------------------------------------------------------------------
      | CLEAR PENDING RENEWAL PAYMENT
      |--------------------------------------------------------------------------
      */

      membership.renewalPaymentSubmittedAt =
        null;

      membership.renewalPaymentReceivedAt =
        null;

      await membership.save();

      /*
      |--------------------------------------------------------------------------
      | STOP EMAIL
      |--------------------------------------------------------------------------
      */

      try {
        /*
        |--------------------------------------------------------------------------
        | Preferred function if it exists
        |--------------------------------------------------------------------------
        */

        if (
          typeof emailService.sendMembershipStoppedEmail ===
          "function"
        ) {
          await emailService.sendMembershipStoppedEmail({
            membership,
            reason,
          });
        }

        /*
        |--------------------------------------------------------------------------
        | Fallback to generic sendEmail if your
        | emailService exposes it
        |--------------------------------------------------------------------------
        */

        else if (
          typeof emailService.sendEmail ===
          "function"
        ) {
          await emailService.sendEmail({
            to: membership.email,

            subject:
              "AMRI Membership – Membership Stopped",

            text: `
Hello ${membership.name},

Your AMRI membership has been stopped by the administration.

Member ID:
${membership.memberId || "N/A"}

Membership Type:
${membership.membershipType}

Reason:
${reason}

If you wish to reactivate your membership, please contact AMRI.

Regards,
AMRI Team
`,

            html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AMRI Membership Stopped</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#222;
  "
>

<div
  style="
    max-width:680px;
    margin:40px auto;
    background:#ffffff;
    border:1px solid #dddddd;
  "
>

<div
  style="
    background:#101c4d;
    color:#ffffff;
    padding:32px;
  "
>

<h1 style="margin:0;">
AMRI
</h1>

<p
  style="
    color:#f2a223;
    margin:8px 0 0;
  "
>
Membership Status Update
</p>

</div>

<div style="padding:32px;">

<p>
Hello <strong>${membership.name}</strong>,
</p>

<p>
Your AMRI membership has been stopped by the administration.
</p>

<div
  style="
    background:#fff4f4;
    border:1px solid #f0cccc;
    padding:22px;
    margin:25px 0;
  "
>

<p>
<strong>Member ID:</strong>
${membership.memberId || "N/A"}
</p>

<p>
<strong>Membership Type:</strong>
${membership.membershipType}
</p>

<p>
<strong>Stopped On:</strong>
${stoppedAt.toLocaleDateString()}
</p>

<p>
<strong>Reason:</strong>
${reason}
</p>

</div>

<p>
If you wish to continue your AMRI membership,
please contact the AMRI administration team.
</p>

<p>
Regards,<br />
<strong>AMRI Team</strong>
</p>

</div>

</div>

</body>
</html>
`,
          });
        } else {
          console.warn(
            "No membership stop email function is available in emailService.js"
          );
        }
      } catch (emailError) {
        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        | Email failure must NOT undo the membership stop.
        |--------------------------------------------------------------------------
        */

        console.error(
          "Membership stopped email failed:",
          emailError
        );
      }

      return res.status(200).json({
        success: true,

        message:
          "Membership stopped successfully.",

        data: membership,
      });
    } catch (error) {
      console.error(
        "Stop membership error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to stop membership.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| REACTIVATE MEMBERSHIP
|--------------------------------------------------------------------------
| PATCH /api/membership/:id/reactivate
| Admin
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/reactivate",
  protect,
  async (req, res) => {
    try {
      const membership =
        await Membership.findById(
          req.params.id
        );

      if (!membership) {
        return res.status(404).json({
          success: false,

          message:
            "Membership not found.",
        });
      }

      if (
        membership.status !==
          "stopped" &&
        membership.status !==
          "expired"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Only stopped or expired memberships can be reactivated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | LIFETIME
      |--------------------------------------------------------------------------
      */

      if (
        membership.membershipType ===
        "Lifetime"
      ) {
        membership.status =
          "member";

        membership.isMember =
          true;

        membership.membershipStoppedAt =
          null;

        membership.membershipStoppedReason =
          null;

        await membership.save();

        return res.status(200).json({
          success: true,

          message:
            "Lifetime membership reactivated successfully.",

          data: membership,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | DETERMINE ORIGINAL EXPIRY
      |--------------------------------------------------------------------------
      */

      let expiryDate =
        membership.membershipExpiryDate;

      /*
      |--------------------------------------------------------------------------
      | IF STOPPED MEMBERSHIP HAS A PREVIOUS
      | EXPIRY DATE, RESTORE IT
      |--------------------------------------------------------------------------
      */

      if (
        membership.status ===
        "stopped"
      ) {
        expiryDate =
          membership.previousMembershipExpiryDate ||
          membership.membershipExpiryDate;
      }

      /*
      |--------------------------------------------------------------------------
      | IF ORIGINAL MEMBERSHIP PERIOD HAS
      | ALREADY EXPIRED, START A NEW PERIOD
      |--------------------------------------------------------------------------
      */

      const now =
        new Date();

      if (
        !expiryDate ||
        new Date(expiryDate) <= now
      ) {
        /*
        |--------------------------------------------------------------------------
        | Reactivation after expiry requires a new
        | membership period.
        |
        | This keeps the membership dynamically valid.
        |--------------------------------------------------------------------------
        */

        const newStartDate =
          now;

        const newExpiryDate =
          calculateMembershipExpiry(
            newStartDate,
            membership.membershipType
          );

        membership.membershipStartDate =
          newStartDate;

        membership.membershipExpiryDate =
          newExpiryDate;

        membership.paymentReceivedAt =
          membership.paymentReceivedAt ||
          newStartDate;
      } else {
        membership.membershipExpiryDate =
          expiryDate;
      }

      /*
      |--------------------------------------------------------------------------
      | RENEWAL ID
      |--------------------------------------------------------------------------
      */

      if (
        !membership.renewalId
      ) {
        membership.renewalId =
          await generateRenewalId();
      }

      /*
      |--------------------------------------------------------------------------
      | REACTIVATE
      |--------------------------------------------------------------------------
      */

      membership.status =
        "member";

      membership.isMember =
        true;

      membership.membershipStoppedAt =
        null;

      membership.membershipStoppedReason =
        null;

      membership.renewalReminderSent =
        false;

      membership.renewalReminderSentAt =
        null;

      await membership.save();

      /*
      |--------------------------------------------------------------------------
      | SEND REACTIVATION EMAIL
      |--------------------------------------------------------------------------
      */

      try {
        if (
          typeof emailService.sendEmail ===
          "function"
        ) {
          await emailService.sendEmail({
            to: membership.email,

            subject:
              "AMRI Membership – Membership Reactivated",

            text: `
Hello ${membership.name},

Your AMRI membership has been reactivated.

Member ID:
${membership.memberId || "N/A"}

Membership Type:
${membership.membershipType}

Membership Expiry:
${
  membership.membershipExpiryDate
    ? new Date(
        membership.membershipExpiryDate
      ).toLocaleDateString()
    : "N/A"
}

Renewal ID:
${membership.renewalId || "N/A"}

Welcome back to AMRI.

Regards,
AMRI Team
`,
          });
        }
      } catch (emailError) {
        console.error(
          "Membership reactivation email failed:",
          emailError
        );
      }

      return res.status(200).json({
        success: true,

        message:
          "Membership reactivated successfully.",

        data: membership,
      });
    } catch (error) {
      console.error(
        "Reactivate membership error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to reactivate membership.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE MEMBERSHIP
|--------------------------------------------------------------------------
| DELETE /api/membership/:id
| Admin
|--------------------------------------------------------------------------
|
| Allowed:
| - submitted
| - bank_details_sent
| - stopped
| - expired
|
| Not allowed:
| - active member
| - verified payment waiting for activation
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const membership =
        await Membership.findById(
          req.params.id
        );

      if (!membership) {
        return res.status(404).json({
          success: false,

          message:
            "Membership record not found.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | NEVER DELETE ACTIVE MEMBER
      |--------------------------------------------------------------------------
      */

      if (
        membership.isMember ||
        membership.status ===
          "member"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Active members cannot be deleted. Stop the membership first.",
        });
      }

        /*
        |--------------------------------------------------------------------------
        | VERIFIED PAYMENT PROTECTION
        |--------------------------------------------------------------------------
        |
        | A payment-received application that is still waiting
        | to become an active member must not be deleted.
        |
        | However, stopped and expired memberships may be
        | permanently deleted even if they had a verified payment
        | in the past.
        |--------------------------------------------------------------------------
        */

        if (
          membership.status === "payment_received" &&
          !membership.isMember
        ) {
          return res.status(400).json({
            success: false,

            message:
              "A verified payment is waiting for membership activation and cannot be deleted.",
          });
        }
        
      /*
      |--------------------------------------------------------------------------
      | DELETE
      |--------------------------------------------------------------------------
      */

      await Membership.findByIdAndDelete(
        req.params.id
      );

      return res.status(200).json({
        success: true,

        message:
          "Membership record deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete membership error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to delete membership record.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| MANUAL STATUS UPDATE
|--------------------------------------------------------------------------
| PUT /api/membership/:id/status
| Admin
|--------------------------------------------------------------------------
*/

router.put(
  "/:id/status",
  protect,
  async (req, res) => {
    try {
      const {
        status,
      } = req.body;

      const allowedStatuses = [
        "submitted",
        "bank_details_sent",
        "payment_submitted",
        "payment_received",
        "member",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid membership status.",
        });
      }

      const membership =
        await Membership.findById(
          req.params.id
        );

      if (!membership) {
        return res.status(404).json({
          success: false,

          message:
            "Membership application not found.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PAYMENT RECEIVED
      |--------------------------------------------------------------------------
      */

      if (
        status ===
        "payment_received"
      ) {
        if (
          !membership.bankDetailsSent
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Bank details must be sent first.",
          });
        }

        if (
          !membership.receipt?.url
        ) {
          return res.status(400).json({
            success: false,

            message:
              "A payment receipt is required before confirming payment.",
          });
        }

        if (
          membership.status !==
          "payment_submitted"
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Applicant must submit payment before payment can be confirmed.",
          });
        }

        const paymentDate =
          new Date();

        membership.paymentReceived =
          true;

        membership.paymentReceivedAt =
          paymentDate;

        membership.membershipStartDate =
          paymentDate;

        membership.membershipExpiryDate =
          calculateMembershipExpiry(
            paymentDate,
            membership.membershipType
          );

        if (
          membership.membershipType !==
            "Lifetime" &&
          !membership.renewalId
        ) {
          membership.renewalId =
            await generateRenewalId();
        }

        membership.renewalReminderSent =
          false;

        membership.renewalReminderSentAt =
          null;
      }

      /*
      |--------------------------------------------------------------------------
      | MEMBER
      |--------------------------------------------------------------------------
      */

      if (
        status === "member"
      ) {
        if (
          membership.status !==
          "payment_received"
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Payment must be verified before activating membership.",
          });
        }

        membership.isMember =
          true;

        if (
          !membership.memberId
        ) {
          membership.memberId =
            await generateMemberId();
        }

        if (
          !membership.membershipStartDate
        ) {
          membership.membershipStartDate =
            membership.paymentReceivedAt ||
            new Date();
        }

        if (
          !membership.membershipExpiryDate
        ) {
          membership.membershipExpiryDate =
            calculateMembershipExpiry(
              membership.membershipStartDate,
              membership.membershipType
            );
        }

        if (
          membership.membershipType !==
            "Lifetime" &&
          !membership.renewalId
        ) {
          membership.renewalId =
            await generateRenewalId();
        }

        membership.membershipStoppedAt =
          null;

        membership.membershipStoppedReason =
          null;
      }

      membership.status =
        status;

      await membership.save();

      return res.status(200).json({
        success: true,

        message:
          "Membership status updated successfully.",

        data: membership,
      });
    } catch (error) {
      console.error(
        "Update membership status error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to update membership status.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| STARTUP EXPIRY CHECK
|--------------------------------------------------------------------------
|
| Runs once when this route file loads.
|--------------------------------------------------------------------------
*/

expireMemberships().catch(
  (error) => {
    console.error(
      "Initial membership expiry check failed:",
      error
    );
  }
);

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = router;