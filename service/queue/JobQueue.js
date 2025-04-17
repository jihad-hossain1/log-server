class JobQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  // Add a job to the queue
  add(data) {
    const jobId = `job_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    console.log(
      `Job owner added to queue with ID: ${jobId} at - ${new Date().toLocaleTimeString()}`
    );
    // Add the job to the queue
    this.queue.push({ data, id: jobId, status: "pending" });
    return jobId;
  }

  // Process pending jobs in the queue
  async processPendingJobs() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.some((job) => job.status === "pending")) {
      const job = this.queue.find((j) => j.status === "pending");
      if (!job) break;

      job.status = "in-progress";
      try {
        console.log(`Processing job ${job.id}`);
        await this.processJob(job.data); // Custom job processing logic
        job.status = "completed";
        console.log(`Job ${job.id} completed`);
      } catch (error) {
        job.status = "failed";
        console.error(`Job ${job.id} failed:`, error);
      }
    }

    this.isProcessing = false;
  }

  // Override this method for custom job processing
  async processJob(data) {
    throw new Error("processJob method not implemented.");
  }

  // job store in file
  saveJobToFile(data) {
    // Implement your logic to save job to a file
  }

  // Get all jobs (for debugging or API responses)
  getJobs() {
    return this.queue;
  }
}

module.exports = JobQueue;
