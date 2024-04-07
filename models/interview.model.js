const { DataTypes } = require("sequelize");
const sequelize = require("./../config/database");
const Application = require("./application.model");
const User = require("./user.model");

const Interview = sequelize.define("Interview", {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "completed", "cancelled"),
    defaultValue: "pending",
  },
});

Application.hasMany(Interview, {
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Interview.belongsTo(Application, {
  foreignKey: {
    allowNull: false,
  },
});

User.hasMany(Interview, {
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Interview.belongsTo(User, {
  foreignKey: {
    allowNull: false,
  },
});

module.exports = Interview;
