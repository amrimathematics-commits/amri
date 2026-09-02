const express = require("express");
const multer = require("multer");

const mongoose = require("mongoose");

const Membership = require("../models/Membership");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| RENEWAL FEE
|--------------------------------------------------------------------------
*/

const RENEWAL_FEE = 500;

/*
|--------------------------------------------------------------------------
| MULTER
|--------------------------------------------------------------------------
*/

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Only JPG, PNG, WEBP and PDF files are allowed."
        )
      );
    }

    cb(null, true);
  },
});

/*
|--------------------------------------------------------------------------
| GENERATE RENEWAL ID
|--------------------------------------------------------------------------
*/

const generateRenewalId = async () => {
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
};

/*
|--------------------------------------------------------------------------
| GET RENEWAL INFORMATION
|--------------------------------------------------------------------------
|
| GET /api/renewal/:renewalId
|
| Public
|
|--------------------------------------------------------------------------
*/

router.get(
  "/:renewalId",
  async (req, res) => {
    try {
      const renewalId =
        String(
          req.params.renewalId || ""
        ).trim();

      if (!renewalId) {
        return res.status(400).json({
          success: false,
          message:
            "Renewal ID is required.",
        });
      }

      const membership =
        await Membership.findOne({
          renewalId,
        }).select(
          "name email memberId renewalId membershipType membershipStartDate membershipExpiryDate isMember status renewalPaymentSubmittedAt"
        );

      if (!membership) {
        return res.status(404).json({
          success: false,
          message:
            "Renewal ID not found.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | MEMBERSHIP MUST BE RENEWABLE
      |--------------------------------------------------------------------------
      */

      if (
        !membership.memberId ||
        membership.status === "stopped"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This membership cannot be renewed.",
        });
      }

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
      | ALREADY SUBMITTED
      |--------------------------------------------------------------------------
      */

      if (
        membership.renewalPaymentSubmittedAt
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A renewal payment has already been submitted for this Renewal ID.",
        });
      }

      return res.status(200).json({
        success: true,

        data: {
          name: membership.name,
          memberId: membership.memberId,
          renewalId: membership.renewalId,
          membershipType:
            membership.membershipType,
          membershipStartDate:
            membership.membershipStartDate,
          membershipExpiryDate:
            membership.membershipExpiryDate,
          renewalFee: RENEWAL_FEE,
          isMember: membership.isMember,
          status: membership.status,
        },
      });
    } catch (error) {
      console.error(
        "Renewal lookup error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load renewal information.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| SUBMIT RENEWAL PAYMENT
|--------------------------------------------------------------------------
|
| POST /api/renewal/:renewalId/submit
|
| Public
|
| Requires:
|
| receipt
|
|--------------------------------------------------------------------------
*/

router.post(
  "/:renewalId/submit",
  upload.single("receipt"),
  async (req, res) => {
    try {
      const renewalId =
        String(
          req.params.renewalId || ""
        ).trim();

      /*
      |--------------------------------------------------------------------------
      | VALIDATE RENEWAL ID
      |--------------------------------------------------------------------------
      */

      if (!renewalId) {
        return res.status(400).json({
          success: false,
          message:
            "Renewal ID is required.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | VALIDATE RECEIPT
      |--------------------------------------------------------------------------
      */

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload your renewal payment receipt.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | FIND MEMBERSHIP
      |--------------------------------------------------------------------------
      */

      const membership =
        await Membership.findOne({
          renewalId,
        });

      if (!membership) {
        return res.status(404).json({
          success: false,
          message:
            "Renewal ID not found.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | VALIDATE MEMBERSHIP
      |--------------------------------------------------------------------------
      */

      if (!membership.memberId) {
        return res.status(400).json({
          success: false,
          message:
            "This applicant does not have an active member ID.",
        });
      }

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

      if (
        membership.status ===
        "stopped"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This membership has been stopped and cannot be renewed.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PREVENT DUPLICATE RENEWAL SUBMISSION
      |--------------------------------------------------------------------------
      */

      if (
        membership.renewalPaymentSubmittedAt
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Renewal payment has already been submitted.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | UPLOAD TO CLOUDINARY
      |--------------------------------------------------------------------------
      */

      const resourceType =
        req.file.mimetype ===
        "application/pdf"
          ? "raw"
          : "image";

      const result =
        await new Promise(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder:
                    "amri/membership-renewals",

                  resource_type:
                    resourceType,

                  use_filename: true,

                  unique_filename: true,

                  overwrite: false,
                },

                (error, uploaded) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(uploaded);
                  }
                }
              );

            stream.end(
              req.file.buffer
            );
          }
        );

      /*
      |--------------------------------------------------------------------------
      | SAVE RENEWAL RECEIPT
      |--------------------------------------------------------------------------
      |
      | We intentionally store the renewal receipt
      | inside the existing receipt object.
      |
      |--------------------------------------------------------------------------
      */

      membership.receipt = {
        url: result.secure_url,

        publicId:
          result.public_id,

        fileName:
          req.file.originalname,

        uploadedAt:
          new Date(),
      };

      membership.renewalPaymentSubmittedAt =
        new Date();

      /*
      |--------------------------------------------------------------------------
      | SAVE
      |--------------------------------------------------------------------------
      */

      await membership.save();

      return res.status(200).json({
        success: true,

        message:
          "Renewal payment receipt submitted successfully. AMRI will verify your payment.",

        data: {
          renewalId:
            membership.renewalId,

          renewalPaymentSubmittedAt:
            membership.renewalPaymentSubmittedAt,
        },
      });
    } catch (error) {
      console.error(
        "Renewal payment submission error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to submit renewal payment.",
      });
    }
  }
);

module.exports = router;