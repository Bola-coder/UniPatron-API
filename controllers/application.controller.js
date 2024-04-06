const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Application = require("../models/application.model");
const Job = require("../models/job.model");
const { uploader } = require("../utils/cloudinary");

const createApplication = catchAsync(async (req, res, next) => {
  const { jobID } = req.params;
  const { resume, coverLetter } = req.body;
  const userID = req.user.id;

  console.log(req.file);
  console.log(req.body);
  if (!req.file) {
    return next(new AppError("Please upload a resume", 400));
  }

  const job = await Job.findByPk(jobID);

  if (!job) {
    return next(new AppError("Job with the specified ID not found", 404));
  }

  const prevApplication = await Application.findAll({
    where: { JobId: jobID, UserId: userID },
  });

  if (prevApplication.length > 0) {
    return next(new AppError("You have already applied to this job", 400));
  }

  //   check if the uploaded file is a .pdf
  if (req.file.mimetype !== "application/pdf") {
    return next(new AppError("Please upload a PDF file", 400));
  }

  // Upload to cloudinary
  const uploadedFile = await uploader.upload(req.file.path, {
    folder: "Unipatron/resumes",
    resource_type: "raw",
  });
  // console.log(uploadedFile);

  const resumeLink = uploadedFile.secure_url;

  const application = await Application.create({
    JobId: jobID,
    UserId: userID,
    resume: resumeLink,
    coverLetter,
  });

  res.status(201).json({
    status: "success",
    data: {
      application,
    },
  });
});

const reviewApplicatiom = catchAsync(async (req, res, next) => {
  const { applicationID } = req.params;
  const { status } = req.body;

  const application = await Application.findByPk(applicationID);

  if (!application) {
    return next(
      new AppError("Application with the specified ID not found", 404)
    );
  }

  application.status = status;
  await application.save();

  res.status(200).json({
    status: "success",
    data: {
      application,
    },
  });
});

// TODO:
// Review Application
// Schedule Interview
// Reject Application
// Accept Application
// Notification System
// Feedback System

module.exports = {
  createApplication,
};
