// database.js
const { Sequelize } = require("sequelize");

const db_host = process.env.DB_HOST || "localhost";
const db_port = process.env.DB_PORT || 5432;
const db_user = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;
const db_name = process.env.DB_DATABASE;
const sequelize = new Sequelize({
  dialect: "postgres",
  host: db_host,
  port: db_port,
  username: db_user,
  password: db_password,
  database: db_name,
  ssl: true, // Enable SSL
  dialectOptions: {
    ssl: {
      require: true, // This is the key option to enforce SSL
    },
  },
});

module.exports = sequelize;
