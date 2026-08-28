const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { error } = require("../utils/apiResponse");

const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    if (!token) return error(res, 401, "Not authorized, no token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return error(res, 401, "Not authorized, admin not found");

    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return error(res, 401, "Session expired, please log in again");
    }
    return error(res, 401, "Not authorized, invalid token");
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.admin.role)) {
    return error(res, 403, "Forbidden: insufficient permissions");
  }
  next();
};

module.exports = { protect, authorize };
