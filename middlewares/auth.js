const jwt = require("jsonwebtoken");
const AppError = require("./../utils/AppError");
const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/user.model");

const protectRoutes = catchAsync(async (req, res, next) => {
  // Get the token from the request headers
  if (
    !req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return next(new AppError("Unauthorized", 401));
  }
  const token = req.headers.authorization.split(" ")[1];

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.id) {
    return next(
      new AppError("Invalid token supplied, Please login again", 401)
    );
  }

  const user = await User.findByPk(decoded.id);

  if (!user) {
    return next(new AppError("User with the token supplied not found", 404));
  }

  req.user = user;
  next();
});

const verifyIsAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new AppError("Unauthorized", 401));
  }
  next();
});

module.exports = { protectRoutes, verifyIsAdmin };
