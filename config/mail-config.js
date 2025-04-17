const dotenv = require("dotenv");
dotenv.config();

const mailService = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  password: process.env.MAIL_PASS,
  user: process.env.MAIL_USER,
  tls: process.env.PRODUCTION == "development" ? false : false,
};

module.exports = { mailService };
