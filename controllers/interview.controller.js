const Interview = require("../models/interview.model");
const Application = require("../models/application.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/email");

const scheduleInterview = catchAsync(async (req, res, next) => {
  const { applicationID } = req.params;
  const { date, time, link } = req.body;

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

  const interview = await Interview.create({
    date,
    time,
    link,
    ApplicationId: applicationID,
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

  await application.update();

  res.status(200).json({
    status: "success",
    message: "Interview scheduled successfully",
    data: {
      interview,
      application,
    },
  });
});

module.exports = {
  scheduleInterview,
};
