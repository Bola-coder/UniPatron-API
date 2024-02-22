const User = require("./../models/user.model");
const AppError = require("./../utils/AppError");
const catchAsync = require("./../utils/catchAsync");
const { signJWTToken } = require("./../utils/jwt");
const bcrypt = require("bcryptjs");

const signup = catchAsync(async (req, res, next) => {
  const { email, password, firstname, lastname, bio } = req.body;
  if (!email || !password || !firstname || !lastname) {
    return next(new AppError("Please fill in the required fields", 404));
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({
    email,
    password: hashedPassword,
    firstname,
    lastname,
    bio,
  });

  if (!user) {
    return next(new AppError("Failed to create new user and", 404));
  }

  const token = signJWTToken(user.id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({
    where: { email },
    attributes: { include: ["password"] },
  });
  if (!user) {
    return next(
      new AppError("User with the specified email address not found", 404)
    );
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!user || !isPasswordCorrect) {
    return next(new AppError("Invalid email or password", 401));
  }

  const token = signJWTToken(user.id);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

module.exports = { signup, login };
