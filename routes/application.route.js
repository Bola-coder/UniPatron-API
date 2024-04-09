const express = require("express");
const authMiddleware = require("./../middlewares/auth");
const applicationController = require("./../controllers/application.controller");
const fileUpload = require("./../utils/multer");

const router = express.Router();

router.use(authMiddleware.protectRoutes);
router.use(authMiddleware.isEmailVerified);
router
  .route("/:jobID")
  .post(fileUpload.single("resume"), applicationController.createApplication)
  .get(
    authMiddleware.verifyIsAdmin,
    applicationController.getAllApplicationsToAJob
  );

router
  .route("/application/:applicationID")
  .get(applicationController.getApplicationDetails);

router
  .route("/:applicationID/review")
  .patch(authMiddleware.verifyIsAdmin, applicationController.reviewApplicatiom);

router
  .route("/:applicationID/reject")
  .patch(authMiddleware.verifyIsAdmin, applicationController.rejectApplication);

router
  .route("/:applicationID/accept")
  .patch(authMiddleware.verifyIsAdmin, applicationController.acceptApplication);

router.route("/user/all").get(applicationController.getApplications);

module.exports = router;
