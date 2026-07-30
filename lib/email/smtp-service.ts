import nodemailer from "nodemailer";
import {
  getSmtpConfig,
  SMTP_MAX_RETRIES,
  type SmtpConfig,
} from "./config";

export type SmtpVerifyResult = {
  ok: boolean;
  attempts: number;
  error?: string;
  /** Never includes credentials. */
  host?: string;
  port?: number;
};

type SendPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
  replyTo?: string;
};

type SmtpPool = {
  verify(): Promise<void>;
  sendMail(mail: Record<string, unknown>): Promise<{ messageId?: string; response?: string }>;
  close(): void;
};

let pool: SmtpPool | null = null;
let lastVerify: SmtpVerifyResult | null = null;
let lastFailureAt: string | null = null;
let lastFailureMessage = "";

function safeSmtpMeta(cfg: SmtpConfig) {
  return { host: cfg.host, port: cfg.port, secure: cfg.secure, user: cfg.user };
}

export function getLastSmtpVerify(): SmtpVerifyResult | null {
  return lastVerify;
}

export function getLastSmtpFailure(): { at: string; message: string } | null {
  if (!lastFailureAt) return null;
  return { at: lastFailureAt, message: lastFailureMessage };
}

/** Create / reuse a pooled SMTP transport. Password never logged. */
export function getSmtpTransport(): SmtpPool | null {
  const cfg = getSmtpConfig();
  if (!cfg) return null;
  if (pool) return pool;

  pool = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    auth: {
      user: cfg.user,
      pass: cfg.password,
    },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
  }) as unknown as SmtpPool;

  return pool;
}

export function resetSmtpTransport(): void {
  if (pool) {
    try {
      pool.close();
    } catch {
      /* ignore */
    }
  }
  pool = null;
}

/**
 * Verify SMTP during startup (and on demand).
 * Retries up to SMTP_MAX_RETRIES times; stores failure without exposing credentials.
 */
export async function verifySmtpConnection(
  maxAttempts: number = SMTP_MAX_RETRIES
): Promise<SmtpVerifyResult> {
  const cfg = getSmtpConfig();
  if (!cfg) {
    const result: SmtpVerifyResult = {
      ok: false,
      attempts: 0,
      error: "SMTP not configured (missing SMTP_HOST / SMTP_USER / SMTP_PASSWORD)",
    };
    lastVerify = result;
    return result;
  }

  let lastError = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      resetSmtpTransport();
      const transport = getSmtpTransport();
      if (!transport) throw new Error("Unable to create SMTP transport");
      await transport.verify();
      const result: SmtpVerifyResult = {
        ok: true,
        attempts: attempt,
        host: cfg.host,
        port: cfg.port,
      };
      lastVerify = result;
      lastFailureAt = null;
      lastFailureMessage = "";
      console.info(
        `[smtp] Connection verified (attempt ${attempt}/${maxAttempts})`,
        safeSmtpMeta(cfg)
      );
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "SMTP verify failed";
      console.error(
        `[smtp] Verify failed (attempt ${attempt}/${maxAttempts}):`,
        lastError,
        safeSmtpMeta(cfg)
      );
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 800 * attempt));
      }
    }
  }

  lastFailureAt = new Date().toISOString();
  lastFailureMessage = lastError;
  const result: SmtpVerifyResult = {
    ok: false,
    attempts: maxAttempts,
    error: lastError,
    host: cfg.host,
    port: cfg.port,
  };
  lastVerify = result;
  return result;
}

/** Send a single message via the pooled transport. */
export async function smtpSend(
  payload: SendPayload
): Promise<{ messageId: string; response: string }> {
  const transport = getSmtpTransport();
  if (!transport) {
    throw new Error("SMTP not configured");
  }
  console.info("[smtp] sendMail start", {
    to: payload.to,
    subject: payload.subject,
    attachments: payload.attachments?.length || 0,
  });
  const info = await transport.sendMail({
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo,
    attachments: payload.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  });
  console.info("[smtp] sendMail accepted", {
    to: payload.to,
    messageId: info.messageId,
    response: info.response,
  });
  return {
    messageId: String(info.messageId || ""),
    response: String(info.response || "accepted"),
  };
}
