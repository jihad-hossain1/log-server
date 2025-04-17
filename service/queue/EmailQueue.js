const { sendEmails } = require("../../utils/sendMail");
const JobQueue = require("./JobQueue");

class EmailQueue extends JobQueue {
  // Process a job in the queue
  async processJob(data) {
    // console.log(`Sending email to ${data.to}`);
    const mail = await sendEmails({
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    if (!mail?.messageId) {
      await this.errorLogger({
        to: data.to,
        ownerId: data.jobOwnerId,
        email: data.to,
      });
    }
    if (mail.messageId) {
      await this.successLogger({ to: data.to, ownerId: data.jobOwnerId });
    }
  }

  // Build successful response saved to a file
  async successLogger({ to, ownerId }) {
    //TODO: Implement success logger
    console.log("jsonD", jsonD);
  }

  async errorLogger({ to, ownerId, email }) {
    //TODO: Implement success logger
    console.log("jsonT", jsonT);
  }
}

// Instantiate the email queue
const emailQueue = new EmailQueue();

module.exports = { emailQueue };
