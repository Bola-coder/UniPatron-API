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
  await application.update({ status });

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

const rejectApplication = catchAsync(async (req, res, next) => {
  const { applicationID } = req.params;

  if (!applicationID) {
    return next(new AppError("Please provide the application ID", 400));
  }

  const application = await Application.findByPk(applicationID, {
    include: ["User", "Job"],
  });

  if (!application) {
    return next(
      new AppError("Application with the specified ID not found", 404)
    );
  }

  // Update application status to rejected
  application.status = "rejected";
  application.update({ status: "rejected" });

  // Send a mail to the user about the rejection
  const message = `We are sorry to inform you that your application for the job ${application.Job.name} has been rejected`;
  const name = application.User.getFullName();
  const template = "application-status";

  const context = { message, name };
  await sendEmail({
    email: application.User.email,
    subject: "Application Rejected",
    template,
    context,
  });

  res.status(200).json({
    status: "success",
    messsgae: "Application rejected successfully",
    data: {
      application,
    },
  });
});

const acceptApplication = catchAsync(async (req, res, next) => {
  const { applicationID } = req.params;

  if (!applicationID) {
    return next(new AppError("Please provide the application ID", 400));
  }

  const application = await Application.findByPk(applicationID, {
    include: ["User", "Job"],
  });

  if (!application) {
    return next(
      new AppError("Application with the specified ID not found", 404)
    );
  }

  // Update application status to rejected
  application.status = "accepted";
  application.update({ status: "accepted" });

  // Send a mail to the user about the rejection
  const message = `We are pleased to inform you that your application for the job ${application.Job.name} has been accepted. You will be contacted with more information by the admin soon`;
  const name = application.User.getFullName();
  const template = "application-status";

  const context = { message, name };
  await sendEmail({
    email: application.User.email,
    subject: "Application Accepted",
    template,
    context,
  });

  res.status(200).json({
    status: "success",
    messsgae: "Application accepted successfully",
    data: {
      application,
    },
  });
});

// User
const getApplications = catchAsync(async (req, res, next) => {
  const applications = await Application.findAll({
    where: { UserId: req.user.id },
    include: "User",
  });

  res.status(200).json({
    status: "success",
    message: "All applications for the user gotten successfullt",
    results: applications.length,
    data: {
      applications,
    },
  });
});

const getApplicationDetails = catchAsync(async (req, res, next) => {
  const { applicationID } = req.params;
  let application = {};
  if (req.user.role === "user") {
    application = await Application.findOne({
      where: { UserId: req.user.id, id: applicationID },
      include: "User",
    });
  } else if (req.user.role === "admin") {
    application = await Application.findOne({
      where: { id: applicationID },
      include: "User",
    });
  } else {
    return;
  }

  res.status(200).json({
    status: "success",
    message: "Application details gotten successfully",
    data: {
      application,
    },
  });
});

module.exports = {
  createApplication,
  getAllApplicationsToAJob,
  reviewApplicatiom,
  rejectApplication,
  acceptApplication,
  getApplications,
  getApplicationDetails,
};
