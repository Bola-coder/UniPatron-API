const router = require("express").Router();
const authMiddlewares = require("./../middlewares/auth");
const companyController = require("./../controllers/company.controller");

router.use(
  authMiddlewares.protectRoutes,
  authMiddlewares.isEmailVerified,
  authMiddlewares.verifyIsAdmin
);

router.route("/").post(companyController.createNewCompany);

module.exports = router;
