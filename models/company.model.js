const sequelize = require("./../config/database");
const { DataTypes } = require("sequelize");

const Company = sequelize.define("Company", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  logo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Company;
