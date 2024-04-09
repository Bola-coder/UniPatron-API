const express = require("express");
const authMiddleware = require("./../middlewares/auth");
const interviewController = require("./../controllers/interview.controller");

const router = express.Router();

router.use(authMiddleware.protectRoutes);

router.route("/").get(interviewController.getAllInterviews);
router
  .route("/:applicationID/")
  .post(authMiddleware.verifyIsAdmin, interviewController.scheduleInterview);

router
  .route("/:interviewID/")
  .get(interviewController.getInterviewDetails)
  .patch(authMiddleware.verifyIsAdmin, interviewController.updateInterview);

router
  .route("/:interviewID/cancel")
  .patch(authMiddleware.verifyIsAdmin, interviewController.cancelInterview);

router
  .route("/:interviewID/complete")
  .patch(
    authMiddleware.verifyIsAdmin,
    interviewController.markInterviewAsComplete
  );

module.exports = router;
