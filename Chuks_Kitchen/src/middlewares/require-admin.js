const { env } = require("../config/env");

function requireAdmin(req, res, next) {
  const token = req.header("x-admin-token");
  if (token !== env.adminToken) {
    return res.status(403).json({
      success: false,
      message: "Admin token is missing or invalid",
    });
  }

  return next();
}

module.exports = { requireAdmin };
