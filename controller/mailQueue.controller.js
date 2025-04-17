const { emailQueue } = require("../service/queue/EmailQueue");

async function sendMailInQueue(request, response, next) {
  try {
    console.log("Starting to process pending jobs...");
    await emailQueue.processPendingJobs();
    return {
      status: 200,
      json: { success: true, message: "Pending jobs are being processed." },
    };
  } catch (error) {
    console.error("Failed to process jobs:", error);
    return {
      status: 500,
      json: { error: error.message },
    };
  }
}

/**
 * @typedef {Object} MailType
 * @property {string} email
 * @property {string} name
 * @property {string} message
 */

async function addMailsToQueue(request, response) {
  const { mails } = request.body;

  const formatMails = mails.map((mail) => ({
    to: mail.email,
    subject: "Test email",
    html: `<p>Hi ${mail.name},</p><p>${mail.message}</p>`,
  }));

  try {
    // Format emails and add to the queue
    for (const mail of formatMails) {
      const jobId = emailQueue.add({
        ...mail,
        jobOwnerId: "59b99db4cfa9a34dcd7885b6",
      });
      console.log(`Job added to queue with ID: ${jobId}`);
    }

    emailQueue.getJobs().forEach(
      async (job) =>
        await prisma.emailTaskQueue.create({
          data: {
            body: job.data.html,
            email: job.data.to,
            subject: job.data.subject,
            userId: job.data.jobOwnerId,
          },
        })
    );

    return response.status(200).json({
      success: true,
      message: "Emails are being processed.",
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message,
    });
  }
}

module.exports = { addMailsToQueue, sendMailInQueue };
