const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Job = require("./job.model");
const User = require("./user.model");

const Application = sequelize.define("Application", {
  status: {
    type: DataTypes.ENUM(
      "pending",
      "review",
      "interviewing",
      "rejected",
      "accepted"
    ),
    defaultValue: "pending",
  },
  resume: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  applicationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Relationships
Job.hasMany(Application, {
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Application.belongsTo(Job, {
  foreignKey: {
    allowNull: false,
  },
});

User.hasMany(Application, {
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Application.belongsTo(User, {
  foreignKey: {
    allowNull: false,
  },
});

module.exports = Application;
