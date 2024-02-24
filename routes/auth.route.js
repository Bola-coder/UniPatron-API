const router = require("express").Router();

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  resendEmailVerificationToken,
  verifyUserEmail,
} = require("./../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login", login);
router.route("/verify/:email/:verification_token").get(verifyUserEmail);
router.post("/verify/resend/", resendEmailVerificationToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:email/:resetToken", resetPassword);
module.exports = router;
