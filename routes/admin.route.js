const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const adminController = require("../controllers/admin.controller");

// Middleware functions
// router.use(authMiddleware.protectRoutes);
// router.use(authMiddleware.verifyIsAdmin);

// Routes
router
  .route("/")
  .get(adminController.getAdmins)
  .post(adminController.createAdmin);

router.route("/login").post(adminController.login);

module.exports = router;
