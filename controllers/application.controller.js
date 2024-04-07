const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Application = require("../models/application.model");
const Job = require("../models/job.model");
const { uploader } = require("../utils/cloudinary");
const sendEmail = require("../utils/email");

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

const getAllApplicationsToAJob = catchAsync(async (req, res, next) => {
  const { jobID } = req.params;

  const applications = await Application.findAll({
    where: { JobId: jobID },
    include: "User",
  });

  res.status(200).json({
    status: "success",
    message:
      "All applications for the job with the specified ID gotten successfullt",
    results: applications.length,
    data: {
      applications,
    },
  });
});

const reviewApplicatiom = catchAsync(async (req, res, next) => {
  const { applicationID } = req.params;
  const { status } = req.body;

  if (!status) {
    return next(
      new AppError("Please provide a status for the application", 400)
    );
  }

  console.log(applicationID, status);

  const application = await Application.findByPk(applicationID, {
    include: ["User", "Job"],
  });

  if (!application) {
    return next(
      new AppError("Application with the specified ID not found", 404)
    );
  }

  application.status = status;
  await application.update();

  const message = `Your application for the job ${application.Job.name} has now moved to status: ${status}`;
  const name = application.User.getFullName();
  const template = "application-status";

  const context = { message, name };

  const mailOptions = {
    email: application.User.email,
    subject: "Application Status",
    template,
    context,
  };

  await sendEmail(mailOptions);

  res.status(200).json({
    status: "success",
    data: {
      application,
    },
  });
});

// TODO:
// Review Application - DONE
// Schedule Interview -DONE
// Reject Application
// Accept Application
// Notification and Reminder System
// Feedback System

module.exports = {
  createApplication,
  getAllApplicationsToAJob,
  reviewApplicatiom,
};
