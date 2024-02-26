const User = require("./../models/user.model");
const AppError = require("./../utils/AppError");
const catchAsync = require("./../utils/catchAsync");
const filterObj = require("./../utils/filterObj");

// Get user profile
const getUserProfile = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findByPk(userID);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Profile retrived successfully",
    data: {
      user,
    },
  });
});

// Update a user by ID
const updateUserProfile = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findByPk(userID);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updatePassword route instead.",
        400
      )
    );
  }

  const allowedFields = ["firstname", "lastname", "bio"];
  filterObj(req.body, allowedFields);

  const updatedUser = await user.update(req.body);
  if (!updatedUser) {
    return next(new AppError("Failed to update user", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User profile updated successfully",
    data: {
      user: updatedUser,
    },
  });
});

// Delete a user by ID
const deleteUserProfile = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const user = await User.findByPk(userID);

  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const deletedUser = await user.destroy();

  if (!deletedUser) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
    data: null,
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
