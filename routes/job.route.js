const express = require("express");
const authMiddleware = require("./../middlewares/auth");
const jobController = require("./../controllers/job.controller");

const router = express.Router();

router.use(authMiddleware.protectRoutes);
router.use(authMiddleware.isEmailVerified);
router.route("/").get(jobController.getAllJobs);

router
  .route("/:companyID")
  .get(jobController.getJobsByCompany)
  .post(authMiddleware.verifyIsAdmin, jobController.createJob);

router
  .route("/job/:jobID")
  .get(jobController.getJobById)
  .patch(jobController.updateJobById)
  .delete(jobController.deleteJobById)
  .delete(jobController.deleteJobById);

// router.route("/job/:jobID").get(jobController.getJobById);
// router.route("/job/:jobID").patch(jobController.updateJobById);
// router.route("/job/:jobID").delete(jobController.deleteJobById);

router.get("/test/:jobID", (req, res) => {
  console.log(req);
  res
    .status(200)
    .json({ message: "Test PATCH route reached", jobID: req.params.jobID });
});

module.exports = router;
