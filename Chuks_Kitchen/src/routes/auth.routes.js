const { Router } = require("express");
const { signupHandler, verifyHandler } = require("../controllers/auth.controller");

const router = Router();

router.post("/signup", signupHandler);
router.post("/verify", verifyHandler);

module.exports = router;
