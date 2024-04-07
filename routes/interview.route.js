const express = require("express");
const authMiddleware = require("./../middlewares/auth");
const interviewController = require("./../controllers/interview.controller");

const router = express.Router();

router.use(authMiddleware.protectRoutes);
router
  .route("/:applicationID/")
  .post(authMiddleware.verifyIsAdmin, interviewController.scheduleInterview);

module.exports = router;
