const router = require("express").Router();
const authMiddleware = require("./../middlewares/auth");
const jobController = require("./../controllers/job.controller");

router.use(authMiddleware.protectRoutes);
router.use(authMiddleware.isEmailVerified);
router.route("/").get(jobController.getAllJobs);
router.route("/job/:jobID").get(jobController.getJobById);
router
  .route("/:companyID")
  .get(jobController.getJobsByCompany)
  .post(authMiddleware.verifyIsAdmin, jobController.createJob);

module.exports = router;
