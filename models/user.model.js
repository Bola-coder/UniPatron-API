// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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

module.exports = User;
