const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user.model");
const { signJWTToken } = require("../utils/jwt");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/email");
const createVerificationTokenAndSendToEmail = require("../utils/createVerificationToken");

// User Management Controller
const getUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({ where: { role: "user" } });

  if (!users) {
    return next(new AppError("No users found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Users retrieved successfully",
    result: users.length,
    data: {
      users,
    },
  });
});

const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.userID);
  if (!user) {
    return next(new AppError("User with the specified ID not found", 404));
  }
  res.status(200).json({
    status: "success",
    message: "User retrieved successfully",
    data: {
      user,
    },
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.userID);
  if (!user) {
    return next(new AppError("User with the specified ID not found", 404));
  }

  const updatedUser = await user.update(req.body);
  if (!updatedUser) {
    return next(new AppError("Failed to update user", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: {
      updatedUser,
    },
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.userID);

  if (!user) {
    return next(new AppError("User with the specified ID not found", 404));
  }

  await user.destroy();
  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
    data: null,
  });
});

const getAdmins = catchAsync(async (req, res, next) => {
  const admins = await User.findAll({ where: { role: "admin" } });

  if (!admins) {
    return next(new AppError("No admin found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Admins retrieved successfully",
    data: {
      admins,
    },
  });
});

const getAdminById = catchAsync(async (req, res, next) => {
  const admin = await User.findOne({
    where: { id: req.params.adminID, role: "admin" },
  });

  if (!admin) {
    return next(new AppError("Admin with the specified ID not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Admin retrieved successfully",
    data: {
      admin,
    },
  });
});

const createAdmin = catchAsync(async (req, res, next) => {
  const { email, password, firstname, lastname } = req.body;
  const adminExists = await User.findOne({
    where: { email: req.body.email },
  });

  if (adminExists) {
    return next(
      new AppError("User with the specified email already exists", 400)
    );
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  const admin = await User.create({
    email,
    password: hashedPassword,
    firstname,
    lastname,
    role: "admin",
  });

  if (!admin) {
    return next(new AppError("Failed to create new admin", 404));
  }

  const hashedVerificationToken = createVerificationTokenAndSendToEmail(
    req,
    admin
  );

  await admin.update({ verificationToken: hashedVerificationToken });

  sendEmail({
    email: admin.email,
    subject: "Admin Account Created for UniPatron",
    message: `An admin account has been created for you. Please check your inbox to verify your email address to activate your account . Your password is ${password}`,
  });

  res.status(201).json({
    status: "success",
    message: "Admin created successfully",
    data: {
      admin,
    },
  });
});

const updateAdmin = catchAsync(async (req, res, next) => {
  const admin = await User.findOne({
    where: { id: req.params.adminID, role: "admin" },
  });

  if (!admin) {
    return next(new AppError("Admin with the specified ID not found", 404));
  }

  const updatedAdmin = await admin.update(req.body);
  if (!updatedAdmin) {
    return next(new AppError("Failed to update admin", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Admin updated successfully",
    data: {
      admin: updatedAdmin,
    },
  });
});

const deleteAdmin = catchAsync(async (req, res, next) => {
  const admin = await User.findOne({
    where: { id: req.params.adminID, role: "admin" },
  });

  if (!admin) {
    return next(new AppError("Admin with the specified ID not found", 404));
  }

  await admin.destroy();
  res.status(204).json({
    status: "success",
    message: "Admin deleted successfully",
    data: null,
  });
});

// Login Endpoint
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const admin = await User.findOne({
    where: { email, role: "admin" },
    attributes: { include: ["password"] },
  });

  if (!admin) {
    return next(
      new AppError("Admin with the specified email address not found", 404)
    );
  }

  if (!admin.emailVerified) {
    return next(new AppError("Please verify your email address", 404));
  }

  const isPasswordCorrect = await bcrypt.compare(password, admin.password);
  if (!admin || !isPasswordCorrect) {
    return next(new AppError("Invalid email or password", 401));
  }

  const token = signJWTToken(admin.id);
  res.status(200).json({
    status: "success",
    mesage: "Admin logged in successfully",
    token,
    data: {
      admin,
    },
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  login,
};
