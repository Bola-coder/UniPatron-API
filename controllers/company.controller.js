const Company = require("./../models/company.model");
const AppError = require("./../utils/AppError");
const catchAsync = require("./../utils/catchAsync");

const createNewCompany = catchAsync(async (req, res, next) => {
  const { name, location, logo } = req.body;

  if (!name || !location || !logo) {
    return next(new AppError("Please provide the name, location, and logo"));
  }

  const company = await Company.create({ name, location, logo });

  if (!company) {
    return next(new AppError("Failed to create new company"));
  }

  res.status(200).json({
    status: "success",
    message: "Created new company successfully",
    data: {
      company,
    },
  });
});

const getAllCompanies = catchAsync(async (req, res, next) => {
  const companies = Company.findAll();
  if (!companies) {
    return next(new AppError("Failed to fetch all companies"));
  }

  res.status(200).json({
    status: "success",
    message: "All companies fetched successfully",
    data: {
      companies,
    },
  });
});

module.exports = { createNewCompany, getAllCompanies };
