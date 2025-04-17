const nodemailer = require("nodemailer");
const { Buffer } = require("buffer");
const { mailService } = require("../config/mail-config");

// Configure the transporter
const transporter = nodemailer.createTransport({
  host: mailService.host,
  port: Number(mailService.port),
  secure: mailService.tls, // true for 465, false for other ports
  auth: {
    user: mailService.user,
    pass: mailService.password, // Use environment variables for sensitive info
  },
});

/**
 * @typedef {Object} MailProps
 * @property {string} to
 * @property {string} subject
 * @property {string} html
 * @property {string} [imgData]
 */

// Function to send emails
/**
 * @param {MailProps} param0
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendEmails({ to, subject, html, imgData }) {
  try {
    // Define mail options
    const mailOptions = {
      from: mailService.user,
      to: to,
      subject: subject,
      html: html,
    };

    // Add image as an attachment if provided
    if (imgData) {
      const buffer = Buffer.from(imgData.split(",")[1], "base64");
      mailOptions.attachments = [
        {
          filename: "file.png",
          content: buffer,
          encoding: "base64",
        },
      ];
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // console.error("Error sending email: ", error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmails };
