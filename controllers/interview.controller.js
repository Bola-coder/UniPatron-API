const Interview = require("../models/interview.model");
const Application = require("../models/application.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/email");
const { Op } = require("sequelize");

// Admin
const scheduleInterview = catchAsync(async (req, res, next) => {
  const { applicationID } = req.params;
  const { date, time, link } = req.body;
  let formattedDate;
  try {
    formattedDate = new Date(date);
  } catch (error) {
    return next(new AppError("Invalid date format", 400));
  }

  // Ensure the date is stored in the database in YYYY-MM-DD format
  const databaseFormattedDate = formattedDate.toISOString().split("T")[0];
  if (!date || !time || !link) {
    return next(
      new AppError("Please provide date, time and link for the interview", 400)
    );
  }

  const application = await Application.findByPk(applicationID, {
    include: ["User", "Job"],
  });

  if (!application) {
    return next(
      new AppError("Application with the specified ID not found", 404)
    );
  }

  // Checks for existing interview that is not cancelled
  const existingInterview = await Interview.findOne({
    where: { ApplicationId: applicationID, status: { [Op.ne]: "cancelled" } },
  });

  if (existingInterview) {
    return next(
      new AppError(
        "An interview already exists for this application. Cancel the existing interview to schedule a new one",
        400
      )
    );
  }

  const interview = await Interview.create({
    date: databaseFormattedDate,
    time,
    link,
    ApplicationId: applicationID,
    UserId: application.UserId,
  });

  if (!interview) {
    return next(new AppError("Interview could not be scheduled", 400));
  }

  //   Send mail to the applicant to inform them of the interview
  const message = `You have an interview scheduled for the job ${application.Job.name} on ${date} at ${time}. The interview will be held on ${link}`;
  const name = application.User.getFullName();
  const template = "interview-scheduled";

  const context = { message, name };
  await sendEmail({
    email: application.User.email,
    subject: "Interview Scheduled",
    template,
    context,
  });

  application.status = "interviewing";

  await application.update({ status: "interviewing" });

  res.status(200).json({
    status: "success",
    message: "Interview scheduled successfully",
    data: {
      interview,
      application,
    },
  });
});

// Admin
const cancelInterview = catchAsync(async (req, res, next) => {
  const { interviewID } = req.params;
  const interview = await Interview.findByPk(interviewID, {
    include: {
      model: Application,
      include: ["User", "Job"],
    },
  });

  if (!interview) {
    return next(new AppError("Interview with the specified ID not found", 404));
  }

  interview.status = "cancelled";

  await interview.update({ status: "cancelled" });
  await interview.Application.update({ status: "review" });

  //  Send mail to the applicant to inform them of the interview cancellation
  const message = `The interview for the job ${interview.Application.Job.name} scheduled for ${interview.date} at ${interview.time} has been cancelled`;
  const name = interview.Application.User.getFullName();
  const template = "interview-cancelled";
  const context = { message, name };
  await sendEmail({
    email: interview.Application.User.email,
    subject: "Interview Cancelled",
    template,
    context,
  });

  res.status(200).json({
    status: "success",
    message: "Interview cancelled successfully",
    data: {
      interview,
    },
  });
});

// Admin
const updateInterview = catchAsync(async (req, res, next) => {
  const { interviewID } = req.params;
  const interview = await Interview.findByPk(interviewID, {
    include: {
      model: Application,
      include: ["User", "Job"],
    },
  });

  if (!interview) {
    return next(new AppError("Interview with the specified ID not found", 404));
  }

  const { date: currentDate, time: currentTime, link: currentLink } = interview;

  const { date, time, link } = req.body;
  let formattedDate;
  try {
    date ? (formattedDate = new Date(date)) : null;
  } catch (error) {
    return next(new AppError("Invalid date format", 400));
  }

  // Ensure the date is stored in the database in YYYY-MM-DD format
  const databaseFormattedDate =
    formattedDate && formattedDate.toISOString().split("T")[0];

  if (!Object.keys(req.body).length) {
    return next(
      new AppError(
        "Please provide either of date, time and link to be updated for the interview",
        400
      )
    );
  }

  date && (interview.date = databaseFormattedDate);
  time && (interview.time = time);
  link && (interview.link = link);

  await interview.update({ date: databaseFormattedDate, time, link });

  //  Send mail to the applicant to inform them of the interview update
  const message = `The interview for the job ${interview.Application.Job.name} scheduled for ${currentDate} at ${currentTime} using link ${currentLink} has been updated. The interview will now be held on ${interview.date} by ${interview.time} using: ${interview.link}`;
  const name = interview.Application.User.getFullName();
  const template = "interview-scheduled";
  const context = { message, name };
  await sendEmail({
    email: interview.Application.User.email,
    subject: "Interview Updated",
    template,
    context,
  });

  res.status(200).json({
    status: "success",
    message: "Interview details updated successfully",
    data: {
      interview,
    },
  });
});

// User and Admin
const getAllInterviews = catchAsync(async (req, res, next) => {
  let interviews = [];
  if (req.user.role === "admin") {
    interviews = await Interview.findAll({
      include: ["Application"],
    });
  } else if (req.user.role === "user") {
    interviews = await Interview.findAll({
      where: { UserId: req.user.id },
      include: ["Application"],
    });
  }

  if (!interviews) {
    return next(new AppError("No interviews found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Interviews fetched successfully",
    result: interviews.length,
    data: {
      interviews,
    },
  });
});

// User and Admin
const getInterviewDetails = catchAsync(async (req, res, next) => {
  let interview = {};

  const { interviewID } = req.params;

  if (!interviewID) {
    return next(
      new AppError(
        "Please provide the ID of the interview you want to view",
        400
      )
    );
  }
  console.log(req.user.id, req.user.role);
  if (req.user.role === "admin") {
    interview = await Interview.findByPk(interviewID, {
      include: ["Application"],
    });
  } else if (req.user.role === "user") {
    interview = await Interview.findOne({
      where: { id: interviewID, UserId: req.user.id },
      include: ["Application"],
    });
  }

  if (!interview) {
    return next(new AppError("Interview with the specified ID not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Interview details fetched successfully",
    data: {
      interview,
    },
  });
});

// Admin
const markInterviewAsComplete = catchAsync(async (req, res, next) => {
  const { interviewID } = req.params;
  const interview = await Interview.findByPk(interviewID, {
    include: {
      model: Application,
      include: ["User", "Job"],
    },
  });

  if (!interview) {
    return next(new AppError("Interview with the specified ID not found", 404));
  }

  if (interview.status === "cancelled") {
    return next(
      new AppError("You can't mark a cancelled interview as completed", 404)
    );
  }

  interview.status = "completed";

  await interview.update({ status: "completed" });
  // await interview.Application.update({ status: "completed" });

  res.status(200).json({
    status: "success",
    message: "Interview marked as completed successfully",
    data: {
      interview,
    },
  });
});

module.exports = {
  scheduleInterview,
  cancelInterview,
  updateInterview,
  getAllInterviews,
  getInterviewDetails,
  markInterviewAsComplete,
};
