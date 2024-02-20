const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/error");
const AppError = require("./utils/AppError");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("Welcome to UniPatrons!");
});

app.get("/api/v1", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to UniPatrons API v1",
  });
});

app.all("*", (req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} using method ${req.method} on this server. Route not defined`,
    404
  );
  next(error);
});

app.use(errorHandler);

module.exports = app;
