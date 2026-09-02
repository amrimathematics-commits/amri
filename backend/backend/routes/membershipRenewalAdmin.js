const express = require("express");

const Membership = require("../models/Membership");

const {
  sendMembershipConfirmationEmail,
} = require("../services/emailService");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| RENEWAL FEE
|--------------------------------------------------------------------------
*/

const RENEWAL_FEE = 500;

/*
|--------------------------------------------------------------------------
| GENERATE NEW RENEWAL ID
|--------------------------------------------------------------------------
*/

async function generateRenewalId() {
  const year = new Date().getFullYear();

  let renewalId;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    renewalId =
      `AMRI-REN-${year}-${randomNumber}`;

    exists = await Membership.exists({
      renewalId,
    });
  }

  return renewalId;
}

/*
|--------------------------------------------------------------------------
| GET PENDING RENEWALS
|--------------------------------------------------------------------------
|
| GET /api/admin/membership-renewals/pending
|
|--------------------------------------------------------------------------
*/

router.get("/pending", async (req, res) => {
  try {
    const renewals = await Membership.find({
      renewalPaymentSubmittedAt: {
        $ne: null,
      },

      renewalPaymentReceivedAt: null,

      status: {
        $ne: "stopped",
      },
    })
      .sort({
        renewalPaymentSubmittedAt: -1,
      })
      .select(
        "name email phone memberId renewalId membershipType membershipStartDate membershipExpiryDate receipt renewalPaymentSubmittedAt renewalPaymentReceivedAt isMember status"
      );

    return res.status(200).json({
      success: true,
      data: renewals,
    });
  } catch (error) {
    console.error(
      "Get pending renewals error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load pending renewals.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| APPROVE RENEWAL
|--------------------------------------------------------------------------
|
| POST /api/admin/membership-renewals/:id/approve
|
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/approve",
  async (req, res) => {
    try {
      const { id } = req.params;

      /*
      |--------------------------------------------------------------------------
      | FIND MEMBERSHIP
      |--------------------------------------------------------------------------
      */

      const membership =
        await Membership.findById(id);

      if (!membership) {
        return res.status(404).json({
          success: false,
          message:
            "Membership record not found.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | VALIDATION
      |--------------------------------------------------------------------------
      */

      if (!membership.memberId) {
        return res.status(400).json({
          success: false,
          message:
            "This record does not have a Member ID.",
        });
      }

      if (
        membership.membershipType ===
        "Lifetime"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Lifetime membership does not require renewal.",
        });
      }

      if (
        !membership.renewalPaymentSubmittedAt
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Renewal payment has not been submitted.",
        });
      }

      if (
        membership.renewalPaymentReceivedAt
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This renewal has already been approved.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CALCULATE NEW MEMBERSHIP DATES
      |--------------------------------------------------------------------------
      |
      | IMPORTANT:
      |
      | If the old membership has already expired,
      | renewal starts from today.
      |
      | If it has not expired yet,
      | renewal starts from the existing expiry date.
      |
      |--------------------------------------------------------------------------
      */

      const now = new Date();

      const oldExpiry =
        membership.membershipExpiryDate
          ? new Date(
              membership.membershipExpiryDate
            )
          : null;

      let newStartDate;

      if (
        oldExpiry &&
        oldExpiry > now
      ) {
        newStartDate = new Date(
          oldExpiry
        );
      } else {
        newStartDate = new Date(
          now
        );
      }

      /*
      |--------------------------------------------------------------------------
      | NEW EXPIRY = ONE YEAR
      |--------------------------------------------------------------------------
      */

      const newExpiryDate =
        new Date(newStartDate);

      newExpiryDate.setFullYear(
        newExpiryDate.getFullYear() + 1
      );

      /*
      |--------------------------------------------------------------------------
      | SAVE OLD EXPIRY
      |--------------------------------------------------------------------------
      */

      membership.previousMembershipExpiryDate =
        oldExpiry;

      /*
      |--------------------------------------------------------------------------
      | UPDATE MEMBERSHIP
      |--------------------------------------------------------------------------
      */

      membership.membershipStartDate =
        newStartDate;

      membership.membershipExpiryDate =
        newExpiryDate;

      membership.paymentReceived =
        true;

      membership.isMember =
        true;

      membership.status =
        "member";

      membership.renewalPaymentReceivedAt =
        now;

      /*
      |--------------------------------------------------------------------------
      | RESET RENEWAL REMINDER
      |--------------------------------------------------------------------------
      */

      membership.renewalReminderSent =
        false;

      membership.renewalReminderSentAt =
        null;

      membership.renewalPaymentSubmittedAt =
        null;

      /*
      |--------------------------------------------------------------------------
      | GENERATE NEXT RENEWAL ID
      |--------------------------------------------------------------------------
      */

      membership.renewalId =
        await generateRenewalId();

      /*
      |--------------------------------------------------------------------------
      | ADMIN
      |--------------------------------------------------------------------------
      */

      if (req.user?.id) {
        membership.lastActionBy =
          req.user.id;
      }

      /*
      |--------------------------------------------------------------------------
      | SAVE
      |--------------------------------------------------------------------------
      */

      await membership.save();

      /*
      |--------------------------------------------------------------------------
      | EMAIL
      |--------------------------------------------------------------------------
      |
      | We intentionally do NOT call an old/new
      | payment email function here because the
      | existing email system should remain untouched.
      |
      | If your confirmation function accepts the
      | membership object, it can be used here.
      |
      |--------------------------------------------------------------------------
      */

    //   try {
    //     if (
    //       typeof sendMembershipConfirmationEmail ===
    //       "function"
    //     ) {
    //       await sendMembershipConfirmationEmail({
    //         membership,
    //       });
    //     }
    //   } catch (emailError) {
    //     console.error(
    //       "Renewal confirmation email failed:",
    //       emailError
    //     );
    //   }

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          "Membership renewal approved successfully.",

        data: {
          memberId:
            membership.memberId,

          renewalId:
            membership.renewalId,

          membershipStartDate:
            membership.membershipStartDate,

          membershipExpiryDate:
            membership.membershipExpiryDate,

          renewalFee:
            RENEWAL_FEE,
        },
      });
    } catch (error) {
      console.error(
        "Approve renewal error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to approve membership renewal.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| REJECT / CANCEL RENEWAL
|--------------------------------------------------------------------------
|
| POST /api/admin/membership-renewals/:id/reject
|
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/reject",
  async (req, res) => {
    try {
      const { id } = req.params;

      const membership =
        await Membership.findById(id);

      if (!membership) {
        return res.status(404).json({
          success: false,
          message:
            "Membership record not found.",
        });
      }

      membership.renewalPaymentSubmittedAt =
        null;

      membership.renewalPaymentReceivedAt =
        null;

      await membership.save();

      return res.status(200).json({
        success: true,
        message:
          "Renewal payment submission has been rejected.",
      });
    } catch (error) {
      console.error(
        "Reject renewal error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to reject renewal.",
      });
    }
  }
);

module.exports = router;