const { DataTypes } = require("sequelize");
const sequelize = require("./../config/database");
const Company = require("./company.model");

const Job = sequelize.define("Job", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // company: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  requirements: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  duration: {
    type: DataTypes.STRING, // Duration in hours, days, etc.
    allowNull: true,
  },
  rolesAndResponsibilities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  benefits: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("Open", "Closed", "InProgress"),
    defaultValue: "Open",
    allowNull: false,
  },
});

// Creating relationships
Job.belongsTo(Company, {
  foreignKey: {
    allowNull: false,
  },
});
Company.hasMany(Job, {
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

module.exports = Job;
