const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const env = {
  port: Number(process.env.PORT || 4000),
  adminToken: process.env.ADMIN_TOKEN || "admin-secret",
  otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES || 10),
  dbPath: process.env.DB_PATH || path.join(process.cwd(), "data", "chuks_kitchen.db"),
};

module.exports = { env };
