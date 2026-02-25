const { env } = require("../config/env");
const { signUp, verifyUser } = require("../services/auth.service");

function signupHandler(req, res, next) {
  try {
    const data = signUp(req.body, env.otpTtlMinutes);
    return res.status(201).json({
      success: true,
      message: "Signup created. Verify with OTP.",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

function verifyHandler(req, res, next) {
  try {
    const data = verifyUser(req.body);
    return res.status(200).json({
      success: true,
      message: data.message,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  signupHandler,
  verifyHandler,
};
