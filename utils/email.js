const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

// const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const sendEmail = async (options) => {
  //Creating a transporter
  const transporter = nodemailer.createTransport({
    // host: "sandbox.smtp.mailtrap.io",
    // port: 2525,
    service: "Gmail",
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD,
    },
  });

  // configure handlebars options
  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve("./views/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./views/"),
  };

  transporter.use("compile", hbs(handlebarOptions));

  //   Configure mail options
  const mailOptions = {
    from: "Bolarinwa Ahmed <bolarinwaahmed22@gmail.com>",
    to: options.email,
    subject: options.subject,
    template: options.template ? options.template : "email",
    context: options.context,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
