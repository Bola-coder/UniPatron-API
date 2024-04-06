const Job = require("./../models/job.model");
const AppError = require("./../utils/AppError");
const catchAsync = require("./../utils/catchAsync");
const filterObj = require("./../utils/filterObj");

// Get all jobs
const getAllJobs = catchAsync(async (req, res, next) => {
  const jobs = await Job.findAll();
  res.status(200).json({
    status: "success",
    message: "All Jobs fetched successfully",
    result: jobs.length,
    data: {
      jobs,
    },
  });
});

// Get a single job by ID
const getJobById = catchAsync(async (req, res, next) => {
  const jobID = req.params.jobID;
  const job = await Job.findByPk(jobID);
  if (!job) {
    return next(new AppError("Job with the specified ID not found", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Job fetched successfully",
    data: {
      job,
    },
  });
});

// Create a new job
const createJob = catchAsync(async (req, res, next) => {
  const { companyID } = req.params;
  console.log(companyID);
  if (!companyID) {
    return next(
      new AppError("Please supply company ID in request parameters", 400)
    );
  }

  const body = { ...req.body, CompanyId: parseInt(companyID, 10) };

  if (!body) {
    return next(new AppError("Please send request body!!", 404));
  }

  console.log(body);
  const job = await Job.create(body);
  res.status(201).json({
    status: "success",
    message: "Job created successfully",
    data: {
      job,
    },
  });
});

const getJobsByCompany = catchAsync(async (req, res, next) => {
  const { companyID } = req.params;

  const jobs = await Job.findAll({ where: { CompanyId: companyID } });

  if (!jobs) {
    return next(
      new AppError("No jobs found for company with the specified ID", 404)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Jobs fetched successfully",
    result: jobs.length,
    data: {
      jobs,
    },
  });
});

// Update a job by ID
const updateJobById = catchAsync(async (req, res, next) => {
  // const filteredBody = filterObj(req.body, "title", "description", "salary");
  const jobID = req.params.jobID;
  console.log(jobID);
  const job = await Job.findByPk(jobID);
  if (!job) {
    return next(
      new AppError("Job with the specified ID not found not found", 404)
    );
  }

  await job.update(req.body);
  res.status(200).json({
    status: "success",
    message: "Job details updated successfully",
    data: {
      job,
    },
  });
});

// Delete a job by ID
const deleteJobById = catchAsync(async (req, res, next) => {
  const jobID = req.params.jobID;
  if (!jobID) {
    return next(
      new AppError("Please specify the ID of the job you want to delete", 404)
    );
  }
  await Job.destroy({ where: { id: jobID } });

  res.status(200).json({
    status: "success",
    message: "Job deleted successfully!",
    data: null,
  });
});

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJobById,
  deleteJobById,
  getJobsByCompany,
};
