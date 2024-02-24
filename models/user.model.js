// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { createToken, hashToken } = require("../utils/token");

const User = sequelize.define(
  "User",
  {
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
    bio: {
      type: DataTypes.STRING,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    // Define options for the model
    defaultScope: {
      // Define the default attributes to include in queries
      attributes: {
        exclude: ["password"], // Exclude the 'password' field by default
      },
    },
  }
);

// Create an instance method
User.prototype.getFullName = function () {
  return `${this.firstname} ${this.lastname}`;
};

User.prototype.createPasswordResetToken = async function () {
  const resetToken = createToken("hex");

  this.passwordResetToken = hashToken(resetToken);

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

User.prototype.isPasswordResetTokenValid = async function (token) {
  const hashedToken = hashToken(token);

  return (
    this.passwordResetToken === hashedToken &&
    this.passwordResetTokenExpires > Date.now()
  );
};

module.exports = User;
