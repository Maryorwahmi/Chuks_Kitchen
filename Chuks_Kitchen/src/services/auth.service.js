const { db, createId, nowIso, persistDb } = require("../repositories/db");
const { HttpError } = require("../utils/http-error");
const { isValidEmail, isValidPhone } = require("../utils/validators");

function buildReferralCode() {
  return `CHUKS-${Math.floor(100000 + Math.random() * 900000)}`;
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function signUp(payload, otpTtlMinutes) {
  const email = normalizeEmail(payload.email);
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const referralCode = typeof payload.referralCode === "string" ? payload.referralCode.trim() : "";

  if (!email && !phone) {
    throw new HttpError(400, "Either email or phone is required");
  }

  if (email && !isValidEmail(email)) {
    throw new HttpError(400, "Invalid email format");
  }

  if (phone && !isValidPhone(phone)) {
    throw new HttpError(400, "Invalid phone format");
  }

  const duplicate = db.users.find((user) => user.email === email || user.phone === phone);
  if (duplicate) {
    throw new HttpError(409, "Duplicate email or phone number");
  }

  if (referralCode) {
    const referralOwner = db.users.find((user) => user.ownReferralCode === referralCode);
    if (!referralOwner) {
      throw new HttpError(400, "Invalid or expired referral code");
    }
  }

  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  const otpExpiresAt = new Date(Date.now() + otpTtlMinutes * 60 * 1000).toISOString();

  const user = {
    id: createId(),
    email: email || null,
    phone: phone || null,
    referralCodeUsed: referralCode || null,
    ownReferralCode: buildReferralCode(),
    isVerified: false,
    verification: {
      otpCode,
      otpExpiresAt,
      attempts: 0,
    },
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  db.users.push(user);
  persistDb();

  return {
    userId: user.id,
    email: user.email,
    phone: user.phone,
    isVerified: user.isVerified,
    otp: user.verification.otpCode,
    otpExpiresAt: user.verification.otpExpiresAt,
    ownReferralCode: user.ownReferralCode,
  };
}

function verifyUser(payload) {
  const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
  const otp = typeof payload.otp === "string" ? payload.otp.trim() : "";

  if (!userId || !otp) {
    throw new HttpError(400, "userId and otp are required");
  }

  const user = db.users.find((entry) => entry.id === userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  if (user.isVerified) {
    return {
      userId: user.id,
      isVerified: true,
      message: "User already verified",
    };
  }

  const expiresAt = new Date(user.verification.otpExpiresAt).getTime();
  if (Date.now() > expiresAt) {
    throw new HttpError(400, "Invalid or expired OTP");
  }

  if (user.verification.otpCode !== otp) {
    user.verification.attempts += 1;
    user.updatedAt = nowIso();
    persistDb();
    throw new HttpError(400, "Invalid or expired OTP");
  }

  user.isVerified = true;
  user.verification = null;
  user.updatedAt = nowIso();
  persistDb();

  return {
    userId: user.id,
    isVerified: user.isVerified,
    message: "Verification successful",
  };
}

function getUserById(userId) {
  return db.users.find((entry) => entry.id === userId) || null;
}

module.exports = {
  signUp,
  verifyUser,
  getUserById,
};
