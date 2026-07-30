import { SMTP_MAX_RETRIES } from "./config";

export type QueuedEmailJob = {
  id: string;
  createdAt: number;
  attempts: number;
  maxAttempts: number;
  run: () => Promise<void>;
  onFailure?: (error: string, attempts: number) => Promise<void> | void;
};

/**
 * Lightweight in-process retry queue for outbound email.
 * Production VPS single-node friendly; failures are also persisted via EmailLog.
 */
class EmailQueueService {
  private queue: QueuedEmailJob[] = [];
  private running = false;

  enqueue(job: Omit<QueuedEmailJob, "createdAt" | "attempts"> & { attempts?: number }) {
    this.queue.push({
      ...job,
      createdAt: Date.now(),
      attempts: job.attempts ?? 0,
      maxAttempts: job.maxAttempts ?? SMTP_MAX_RETRIES,
    });
    void this.pump();
  }

  size() {
    return this.queue.length;
  }

  private async pump() {
    if (this.running) return;
    this.running = true;
    try {
      while (this.queue.length) {
        const job = this.queue.shift()!;
        try {
          job.attempts += 1;
          await job.run();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Email job failed";
          console.error(`[email-queue] Job ${job.id} failed (attempt ${job.attempts}):`, message);
          if (job.attempts < job.maxAttempts) {
            await new Promise((r) => setTimeout(r, 700 * job.attempts));
            this.queue.push(job);
          } else if (job.onFailure) {
            await job.onFailure(message, job.attempts);
          }
        }
      }
    } finally {
      this.running = false;
    }
  }
}

export const emailQueue = new EmailQueueService();
