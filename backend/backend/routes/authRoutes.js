const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const {
  protect,
  authorize,
} = require("../middleware/auth");

const {
  loginLimiter,
} = require("../middleware/rateLimiter");

const {
  success,
  error,
} = require("../utils/apiResponse");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| JWT TOKEN
|--------------------------------------------------------------------------
*/

const signToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "7d",
    }
  );

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

router.post(
  "/login",
  loginLimiter,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return error(
          res,
          400,
          "Email and password are required"
        );
      }

      const admin = await Admin.findOne({
        email: email.toLowerCase().trim(),
      }).select("+password");

      if (!admin) {
        return error(
          res,
          401,
          "Invalid credentials"
        );
      }

      const isMatch =
        await admin.comparePassword(password);

      if (!isMatch) {
        return error(
          res,
          401,
          "Invalid credentials"
        );
      }

      const token = signToken(admin._id);

      const adminData = admin.toObject();

      delete adminData.password;

      return success(
        res,
        200,
        "Login successful",
        {
          token,
          admin: adminData,
        }
      );
    } catch (err) {
      next(err);
    }
  }
);

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

router.post(
  "/logout",
  protect,
  (req, res) => {
    return success(
      res,
      200,
      "Logged out successfully"
    );
  }
);

/*
|--------------------------------------------------------------------------
| CURRENT ADMIN
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  protect,
  (req, res) => {
    const adminData =
      req.admin.toObject();

    delete adminData.password;

    return success(
      res,
      200,
      "Fetched admin profile",
      adminData
    );
  }
);

/*
|--------------------------------------------------------------------------
| GET ALL ADMINS
|--------------------------------------------------------------------------
| SUPERADMIN ONLY
|--------------------------------------------------------------------------
*/

router.get(
  "/admins",
  protect,
  authorize("superadmin"),
  async (req, res, next) => {
    try {
      const admins = await Admin.find()
        .select("name email role createdAt updatedAt")
        .sort({ createdAt: -1 });

      return success(
        res,
        200,
        "Admins fetched successfully",
        admins
      );
    } catch (err) {
      next(err);
    }
  }
);

/*
|--------------------------------------------------------------------------
| CREATE NEW ADMIN
|--------------------------------------------------------------------------
| SUPERADMIN ONLY
|--------------------------------------------------------------------------
*/

router.post(
  "/admins",
  protect,
  authorize("superadmin"),
  async (req, res, next) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      /*
      |--------------------------------------------------------------------------
      | VALIDATION
      |--------------------------------------------------------------------------
      */

      if (!name || !name.trim()) {
        return error(
          res,
          400,
          "Admin name is required"
        );
      }

      if (!email || !email.trim()) {
        return error(
          res,
          400,
          "Admin email is required"
        );
      }

      if (!password) {
        return error(
          res,
          400,
          "Admin password is required"
        );
      }

      if (password.length < 8) {
        return error(
          res,
          400,
          "Password must be at least 8 characters"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | NORMALIZE EMAIL
      |--------------------------------------------------------------------------
      */

      const normalizedEmail =
        email.toLowerCase().trim();

      /*
      |--------------------------------------------------------------------------
      | CHECK EXISTING ADMIN
      |--------------------------------------------------------------------------
      */

      const existingAdmin =
        await Admin.findOne({
          email: normalizedEmail,
        });

      if (existingAdmin) {
        return error(
          res,
          409,
          "An admin with this email already exists"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE ADMIN
      |--------------------------------------------------------------------------
      */

      const newAdmin = await Admin.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: "admin",
      });

      /*
      |--------------------------------------------------------------------------
      | REMOVE PASSWORD FROM RESPONSE
      |--------------------------------------------------------------------------
      */

      const adminData =
        newAdmin.toObject();

      delete adminData.password;

      return success(
        res,
        201,
        "Admin created successfully",
        adminData
      );
    } catch (err) {
      /*
      |--------------------------------------------------------------------------
      | DUPLICATE EMAIL SAFETY
      |--------------------------------------------------------------------------
      */

      if (err.code === 11000) {
        return error(
          res,
          409,
          "An admin with this email already exists"
        );
      }

      next(err);
    }
  }
);

/*
|--------------------------------------------------------------------------
| PROMOTE ADMIN TO SUPERADMIN
|--------------------------------------------------------------------------
| SUPERADMIN ONLY
|--------------------------------------------------------------------------
*/

router.patch(
  "/admins/:id/promote",
  protect,
  authorize("superadmin"),
  async (req, res, next) => {
    try {
      const admin = await Admin.findById(req.params.id);

      if (!admin) {
        return error(res, 404, "Admin not found");
      }

      // Already a superadmin
      if (admin.role === "superadmin") {
        return error(
          res,
          400,
          "This admin is already a superadmin"
        );
      }

      admin.role = "superadmin";
      await admin.save();

      const adminData = admin.toObject();
      delete adminData.password;

      return success(
        res,
        200,
        "Admin promoted to superadmin successfully",
        adminData
      );
    } catch (err) {
      next(err);
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE ADMIN
|--------------------------------------------------------------------------
| SUPERADMIN ONLY
|--------------------------------------------------------------------------
*/

router.delete(
  "/admins/:id",
  protect,
  authorize("superadmin"),
  async (req, res, next) => {
    try {
      const admin = await Admin.findById(req.params.id);

      if (!admin) {
        return error(res, 404, "Admin not found");
      }

      // Prevent deleting yourself
      if (admin._id.toString() === req.admin._id.toString()) {
        return error(
          res,
          400,
          "You cannot delete your own account"
        );
      }

      await Admin.findByIdAndDelete(req.params.id);

      return success(
        res,
        200,
        "Admin deleted successfully"
      );
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;