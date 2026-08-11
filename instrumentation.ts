export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { syncPacoEnvFromDotenvFile } = await import("@/lib/payments/paco/load-env");
    syncPacoEnvFromDotenvFile();
    console.info("[instrumentation] HBL PACO runtime", {
      env: process.env.HBL_PACO_ENV || "(unset)",
      officeId: process.env.HBL_PACO_OFFICE_ID || "(unset)",
      baseUrl: process.env.HBL_PACO_BASE_URL || "(unset)",
      kid: process.env.HBL_PACO_ENCRYPTION_KEY_ID || "(unset)",
      currency: process.env.HBL_PACO_CURRENCY || "(unset)",
      request3ds: process.env.HBL_PACO_REQUEST_3DS || "(unset)",
      sdkDemoShape: Boolean((process.env.HBL_PACO_SDK_DEMO_SHAPE || "").trim()),
    });
  } catch (err) {
    console.error(
      "[instrumentation] PACO env sync failed:",
      err instanceof Error ? err.message : err
    );
  }

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
