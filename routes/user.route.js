const router = require("express").Router();
const authMiddleware = require("../middlewares/auth");
const userController = require("../controllers/user.controller");

router.use(authMiddleware.protectRoutes);
router.use(authMiddleware.isEmailVerified);

router
  .route("/profile")
  .get(userController.getUserProfile)
  .patch(userController.updateUserProfile)
  .delete(userController.deleteUserProfile);

router.route("/updatePassword").patch(userController.updatePassword);

module.exports = router;
