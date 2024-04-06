const express = require("express");
const authMiddleware = require("./../middlewares/auth");
const applicationController = require("./../controllers/application.controller");
const fileUpload = require("./../utils/multer");

const router = express.Router();

router.use(authMiddleware.protectRoutes);
router.use(authMiddleware.isEmailVerified);
router
  .route("/:jobID")
  .post(fileUpload.single("resume"), applicationController.createApplication);

module.exports = router;
