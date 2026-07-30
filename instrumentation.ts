export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { emailService } = await import("@/lib/email/email-service");
    const result = await emailService.verifyOnStartup();
    if (!result.ok) {
      console.error("[instrumentation] SMTP verification failed after retries:", result.error);
    }
  } catch (err) {
    console.error(
      "[instrumentation] SMTP startup check error:",
      err instanceof Error ? err.message : err
    );
  }
}
