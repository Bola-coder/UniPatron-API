const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const adminController = require("../controllers/admin.controller");

// Routes
router
  .route("/")
  //   .get(adminController.getAdmins)
  .post(adminController.createAdmin);

router.route("/login").post(adminController.login);

// Middleware functions
router.use(authMiddleware.protectRoutes);
router.use(authMiddleware.verifyIsAdmin);

router.route("/users").get(adminController.getUsers);
router
  .route("/users/:userID")
  .get(adminController.getUserById)
  .delete(adminController.deleteUser);
//   .patch(adminController.updateUser);

module.exports = router;
