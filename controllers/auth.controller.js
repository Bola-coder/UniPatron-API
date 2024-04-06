const sendEmail = require("../utils/email");
const User = require("./../models/user.model");
const AppError = require("./../utils/AppError");
const catchAsync = require("./../utils/catchAsync");
const { signJWTToken } = require("./../utils/jwt");
const bcrypt = require("bcryptjs");
const { compareEncryptedString } = require("../utils/encryption");
const createVerificationTokenAndSendToEmail = require("./../utils/createVerificationToken");

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

  const hashedVerificationToken = await createVerificationTokenAndSendToEmail(
    req,
    user
  );

  await user.update({ verificationToken: hashedVerificationToken });

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

// Resend Verification email
const resendEmailVerificationToken = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  // Check if user with email exist
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return next(
      new AppError("User with the specified email address does not exist", 404)
    );
  }

  if (user.emailVerified) {
    return next(new AppError("User has already been verified", 404));
  }

  // Send the verification email to the user
  const hashedVerificationToken = createVerificationTokenAndSendToEmail(
    req,
    user
  );

  // stored a hashed version of the token in the database
  const updatedUser = await user.update({
    verificationToken: hashedVerificationToken,
  });

  res.status(200).json({
    status: "success",
    message: "Verification link has been resent to your email address",
  });
});

// Verify User Email
const verifyUserEmail = catchAsync(async (req, res, next) => {
  const { email, verification_token } = req.params;
  // Check if user with email exist
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return next(
      new AppError("User with the specified email address does not exist", 404)
    );
  }

  // Checks if the user is already verified
  if (user.emailVerified) {
    return next(new AppError("User has already been verified", 404));
  }

  // Checks if the verificationToken in the request params matches the encrypted on in the Db
  if (
    !(await compareEncryptedString(verification_token, user.verificationToken))
  ) {
    return next(new AppError("Invalid verification token", 404));
  }

  // Update the user's verification status
  const verifiedUser = await user.update(
    {
      emailVerified: true,
      verificationToken: null,
    },
    {
      validateBeforeSave: false,
    }
  );

  res.status(200).json({
    status: "success",
    message: "User's email verified successfully",
    user: verifiedUser,
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Please provide email", 400));
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return next(
      new AppError("User with the specified email address not found", 404)
    );
  }

  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordLink = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/reset-password/${user.email}/${resetToken}`;

  const message = `Click the link below to reset your password: \n\n ${resetPasswordLink}`;
  const title = "Reset Password Link";
  const name = `${user?.firstname}  ${user?.lastname}`;
  const document_title = "Unipatron";
  const context = { message, title, name, document_title };

  const mailOptions = {
    email: user.email,
    subject: "Your password reset token (valid for 10 minutes)",
    context,
  };

  await sendEmail(mailOptions);

  res.status(200).json({
    status: "success",
    message: "Password reset token sent to your email!",
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  const { email, resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  if (!email || !resetToken) {
    return next(new AppError("Invalid reset password link", 400));
  }

  if (!password || !confirmPassword) {
    return next(
      new AppError("Please provide password and confirm password", 400)
    );
  }

  const user = await User.findOne({
    where: { email },
    attributes: {
      include: ["passwordResetToken", "passwordResetTokenExpires"],
    },
  });

  if (!user) {
    return next(
      new AppError("User with the specified email address not found", 404)
    );
  }

  const isTokenValid = await user.isPasswordResetTokenValid(resetToken);
  if (!isTokenValid) {
    return next(new AppError("Invalid or expired token", 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  user.password = hashedPassword;
  user.passwordResetToken = null;
  user.passwordResetTokenExpires = null;
  await user.save();

  const token = signJWTToken(user.id);

  res.status(200).json({
    status: "success",
    token,
    message: "Password reset successful",
    data: {
      user,
    },
  });
});

module.exports = {
  signup,
  login,
  verifyUserEmail,
  resendEmailVerificationToken,
  forgotPassword,
  resetPassword,
};
