const express = require("express");

const Membership = require("../models/Membership");
const BankDetails = require("../models/BankDetails");

const { protect } = require("../middleware/auth");

const router = express.Router();

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
    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    renewalId = `AMRI-REN-${year}-${randomNumber}`;

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
| GET /api/admin/membership-renewals/pending
|--------------------------------------------------------------------------
*/

router.get(
  "/pending",
  protect,
  async (req, res) => {
    try {
      const now = new Date();

      const members = await Membership.find({
        isMember: true,
        status: "member",
        membershipExpiryDate: {
          $ne: null,
        },
        membershipType: {
          $ne: "Lifetime",
        },
      })
        .sort({
          membershipExpiryDate: 1,
        })
        .lean();

      /*
      |--------------------------------------------------------------------------
      | ONLY SHOW MEMBERS WHO ARE:
      |
      | 1. Already expired
      | 2. Expiring within 30 days
      | 3. Have already submitted renewal payment
      |--------------------------------------------------------------------------
      */

      const thirtyDaysFromNow = new Date(
        now.getTime() +
          30 * 24 * 60 * 60 * 1000
      );

      const pending = members.filter(
        (member) => {
          const expiry =
            new Date(
              member.membershipExpiryDate
            );

          const isExpiringSoon =
            expiry <=
            thirtyDaysFromNow;

          const hasRenewalPayment =
            !!member.renewalPaymentSubmittedAt;

          return (
            isExpiringSoon ||
            hasRenewalPayment
          );
        }
      );

      return res.status(200).json({
        success: true,
        data: pending,
      });
    } catch (error) {
      console.error(
        "Get pending renewals error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch pending renewals.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| APPROVE RENEWAL
|--------------------------------------------------------------------------
| POST /api/admin/membership-renewals/:id/approve
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/approve",
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
        !membership.renewalPaymentSubmittedAt
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Renewal payment has not been submitted.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | LIFETIME MEMBERSHIP
      |--------------------------------------------------------------------------
      */

      if (
        membership.membershipType ===
        "Lifetime"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Lifetime memberships do not require renewal.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | RENEWAL START DATE
      |--------------------------------------------------------------------------
      |
      | If the existing membership is still active,
      | extend from the existing expiry date.
      |
      | If it has already expired,
      | start from today.
      |
      */

      const now = new Date();

      let startDate = now;

      if (
        membership.membershipExpiryDate
      ) {
        const currentExpiry =
          new Date(
            membership.membershipExpiryDate
          );

        if (
          currentExpiry > now
        ) {
          startDate =
            currentExpiry;
        }
      }

      /*
      |--------------------------------------------------------------------------
      | RENEWAL EXPIRY
      |--------------------------------------------------------------------------
      */

      const expiryDate =
        new Date(startDate);

      expiryDate.setFullYear(
        expiryDate.getFullYear() + 1
      );

      /*
      |--------------------------------------------------------------------------
      | GENERATE NEW RENEWAL ID
      |--------------------------------------------------------------------------
      */

      const renewalId =
        await generateRenewalId();

      /*
      |--------------------------------------------------------------------------
      | SAVE PREVIOUS EXPIRY
      |--------------------------------------------------------------------------
      */

      membership.previousMembershipExpiryDate =
        membership.membershipExpiryDate ||
        null;

      /*
      |--------------------------------------------------------------------------
      | ACTIVATE RENEWAL
      |--------------------------------------------------------------------------
      */

      membership.membershipStartDate =
        startDate;

      membership.membershipExpiryDate =
        expiryDate;

      membership.renewalId =
        renewalId;

      membership.renewalPaymentReceivedAt =
        now;

      membership.renewalPaymentSubmittedAt =
        null;

      membership.renewalReminderSent =
        false;

      membership.renewalReminderSentAt =
        null;

      membership.membershipStoppedAt =
        null;

      membership.membershipStoppedReason =
        null;

      membership.isMember =
        true;

      membership.status =
        "member";

      await membership.save();

      return res.status(200).json({
        success: true,
        message:
          "Membership renewal approved successfully.",
        data: membership,
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
| REJECT RENEWAL
|--------------------------------------------------------------------------
| POST /api/admin/membership-renewals/:id/reject
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/reject",
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

      membership.renewalPaymentSubmittedAt =
        null;

      await membership.save();

      return res.status(200).json({
        success: true,
        message:
          "Renewal payment rejected.",
        data: membership,
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