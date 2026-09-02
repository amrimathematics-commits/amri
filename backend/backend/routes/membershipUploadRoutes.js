const express = require("express");
const multer = require("multer");

const cloudinary = require("../config/cloudinary");
const Membership = require("../models/Membership");

const router = express.Router();


/*
|--------------------------------------------------------------------------
| MULTER
|--------------------------------------------------------------------------
*/

const storage =
  multer.memoryStorage();

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },

    fileFilter: (
      req,
      file,
      cb
    ) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];

      if (
        !allowedTypes.includes(
          file.mimetype
        )
      ) {
        return cb(
          new Error(
            "Only JPG, PNG, WEBP and PDF files are allowed."
          )
        );
      }

      cb(
        null,
        true
      );
    },
  });


/*
|--------------------------------------------------------------------------
| POST PAYMENT RECEIPT
|--------------------------------------------------------------------------
| POST /api/membership-upload/receipt
| Public
|--------------------------------------------------------------------------
|
| Required:
|
| membershipId
| receipt
|
|--------------------------------------------------------------------------
*/

router.post(
  "/receipt",
  upload.single("receipt"),
  async (
    req,
    res
  ) => {
    try {

      /*
      |--------------------------------------------------------------------------
      | VALIDATE MEMBERSHIP ID
      |--------------------------------------------------------------------------
      */

      const membershipId =
        String(
          req.body.membershipId ||
          ""
        ).trim();

      if (!membershipId) {
        return res.status(400).json({
          success: false,

          message:
            "Membership ID is required.",
        });
      }


      /*
      |--------------------------------------------------------------------------
      | VALIDATE FILE
      |--------------------------------------------------------------------------
      */

      if (!req.file) {
        return res.status(400).json({
          success: false,

          message:
            "Please select a payment receipt.",
        });
      }


      /*
      |--------------------------------------------------------------------------
      | FIND MEMBERSHIP
      |--------------------------------------------------------------------------
      */

      const membership =
        await Membership.findById(
          membershipId
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
      | CHECK PAYMENT STAGE
      |--------------------------------------------------------------------------
      */

      if (
        membership.status !==
        "bank_details_sent"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Payment receipt can only be uploaded after AMRI sends the bank details.",
        });
      }


      /*
      |--------------------------------------------------------------------------
      | DETERMINE CLOUDINARY TYPE
      |--------------------------------------------------------------------------
      */

      const resourceType =
        req.file.mimetype ===
        "application/pdf"
          ? "raw"
          : "image";


      /*
      |--------------------------------------------------------------------------
      | UPLOAD TO CLOUDINARY
      |--------------------------------------------------------------------------
      */

      const result =
        await new Promise(
          (
            resolve,
            reject
          ) => {

            const stream =
              cloudinary
                .uploader
                .upload_stream(
                  {
                    folder:
                      "amri/membership-receipts",

                    resource_type:
                      resourceType,

                    use_filename:
                      true,

                    unique_filename:
                      true,

                    overwrite:
                      false,
                  },

                  (
                    error,
                    uploaded
                  ) => {
                    if (
                      error
                    ) {
                      reject(
                        error
                      );
                    } else {
                      resolve(
                        uploaded
                      );
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
      | SAVE RECEIPT TO MEMBERSHIP
      |--------------------------------------------------------------------------
      */

      membership.receipt = {
        url:
          result.secure_url,

        publicId:
          result.public_id,

        fileName:
          req.file.originalname,

        uploadedAt:
          new Date(),
      };


      /*
      |--------------------------------------------------------------------------
      | CHANGE STATUS
      |--------------------------------------------------------------------------
      */

      membership.status =
        "payment_submitted";


      await membership.save();


      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(201).json({
        success: true,

        message:
          "Payment receipt submitted successfully. AMRI will verify your payment.",

        data: {
          membershipId:
            membership._id,

          status:
            membership.status,

          receipt:
            membership.receipt,
        },
      });

    } catch (error) {
      console.error(
        "Membership receipt upload failed:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Receipt upload failed. Please try again.",
      });
    }
  }
);


module.exports = router;