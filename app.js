const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/error");
const AppError = require("./utils/AppError");
const sequelize = require("./config/database");
const authRoutes = require("./routes/auth.route");
const adminRoutes = require("./routes/admin.route");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

async function syncDatabase() {
  try {
    await sequelize.sync({ force: false }); // Set force to true to recreate tables on every sync
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
}

syncDatabase();

app.get("/", (req, res) => {
  res.status(200).send("Welcome to UniPatrons!");
});

app.get("/api/v1/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to UniPatrons API v1",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);

app.all("*", (req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} using method ${req.method} on this server. Route not defined`,
    404
  );
  next(error);
});

app.use(errorHandler);

module.exports = app;
