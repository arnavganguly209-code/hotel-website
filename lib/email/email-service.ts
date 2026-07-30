import { db, isDatabaseAvailable } from "@/lib/db";
import {
  EMAIL_TEMPLATES,
  SMTP_MAX_RETRIES,
  getBookingNotifyEmail,
  getMailFromHeader,
  getHotelMailConfig,
  isSmtpConfigured,
  type EmailTemplateId,
} from "./config";
import { emailQueue } from "./queue-service";
import { buildReservationPdf } from "./pdf-service";
import { smtpSend, verifySmtpConnection } from "./smtp-service";
import {
  renderBookingEmail,
  type BookingEmailContext,
} from "./template-service";

export type SendEmailResult = {
  ok: boolean;
  logId?: string;
  error?: string;
  messageId?: string;
};

async function createLog(input: {
  bookingId?: number | null;
  recipient: string;
  subject: string;
  template: string;
  status: string;
  retryCount?: number;
  meta?: Record<string, unknown>;
}) {
  if (!isDatabaseAvailable()) return null;
  try {
    return await db.emailLog.create({
      data: {
        bookingId: input.bookingId ?? null,
        recipient: input.recipient,
        subject: input.subject,
        template: input.template,
        status: input.status,
        retryCount: input.retryCount ?? 0,
        meta: (input.meta as object | undefined) ?? undefined,
      },
    });
  } catch (err) {
    console.error("[email] Failed to create EmailLog:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function updateLog(
  id: string | undefined | null,
  data: {
    status?: string;
    smtpResponse?: string;
    error?: string;
    sentAt?: Date | null;
    deliveredAt?: Date | null;
    retryCount?: number;
  }
) {
  if (!id || !isDatabaseAvailable()) return;
  try {
    await db.emailLog.update({ where: { id }, data });
  } catch (err) {
    console.error("[email] Failed to update EmailLog:", err instanceof Error ? err.message : err);
  }
}

/**
 * Core EmailService — pool, retry, templates, attachments, logging, resend.
 */
export class EmailService {
  async verifyOnStartup() {
    const result = await verifySmtpConnection(SMTP_MAX_RETRIES);
    if (!result.ok && isDatabaseAvailable()) {
      await createLog({
        recipient: "(smtp-verify)",
        subject: "SMTP connection verification",
        template: EMAIL_TEMPLATES.SMTP_VERIFY,
        status: "failed",
        retryCount: result.attempts,
        meta: {
          error: result.error,
          host: result.host,
          port: result.port,
        },
      });
    }
    return result;
  }

  async sendBookingEmail(opts: {
    template: EmailTemplateId;
    ctx: BookingEmailContext;
    to: string;
    attachPdf?: boolean;
    queue?: boolean;
  }): Promise<SendEmailResult> {
    const rendered = renderBookingEmail(opts.template, opts.ctx);
    const log = await createLog({
      bookingId: opts.ctx.bookingId,
      recipient: opts.to,
      subject: rendered.subject,
      template: opts.template,
      status: opts.queue === false ? "sending" : "queued",
      meta: { attachPdf: Boolean(opts.attachPdf) },
    });

    const run = async () => {
      if (!isSmtpConfigured()) {
        throw new Error("SMTP not configured");
      }
      await updateLog(log?.id, { status: "sending", retryCount: 0 });

      let pdf: Buffer | undefined;
      if (opts.attachPdf) {
        pdf = await buildReservationPdf(opts.ctx);
      }

      const hotel = getHotelMailConfig();
      const info = await smtpSend({
        from: getMailFromHeader(),
        to: opts.to,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        replyTo: hotel.email,
        attachments: pdf
          ? [
              {
                filename: `reservation-${opts.ctx.bookingId}.pdf`,
                content: pdf,
                contentType: "application/pdf",
              },
            ]
          : undefined,
      });

      await updateLog(log?.id, {
        status: "sent",
        smtpResponse: `${info.messageId} | ${info.response}`.slice(0, 500),
        error: "",
        sentAt: new Date(),
        deliveredAt: new Date(),
      });
    };

    if (opts.queue === false) {
      try {
        await run();
        return { ok: true, logId: log?.id };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Send failed";
        await updateLog(log?.id, { status: "failed", error: message.slice(0, 1000) });
        return { ok: false, logId: log?.id, error: message };
      }
    }

    emailQueue.enqueue({
      id: log?.id || `email-${opts.ctx.bookingId}-${opts.template}-${Date.now()}`,
      maxAttempts: SMTP_MAX_RETRIES,
      run,
      onFailure: async (error, attempts) => {
        await updateLog(log?.id, {
          status: "failed",
          error: error.slice(0, 1000),
          retryCount: attempts,
        });
      },
    });

    return { ok: true, logId: log?.id };
  }

  /** Guest confirmation + hotel notification with PDF. */
  async sendNewBookingPair(ctx: BookingEmailContext): Promise<{
    guest: SendEmailResult;
    hotel: SendEmailResult;
  }> {
    const guest = await this.sendBookingEmail({
      template: EMAIL_TEMPLATES.BOOKING_CONFIRMATION,
      ctx,
      to: ctx.guestEmail,
      attachPdf: true,
      queue: true,
    });
    const hotel = await this.sendBookingEmail({
      template: EMAIL_TEMPLATES.HOTEL_NEW_BOOKING,
      ctx,
      to: getBookingNotifyEmail(),
      attachPdf: true,
      queue: true,
    });
    return { guest, hotel };
  }

  async resend(logId: string): Promise<SendEmailResult> {
    if (!isDatabaseAvailable()) return { ok: false, error: "Database not configured" };
    const existing = await db.emailLog.findUnique({ where: { id: logId } });
    if (!existing) return { ok: false, error: "Email log not found" };
    if (!existing.bookingId) return { ok: false, error: "Cannot resend without booking" };

    const booking = await db.booking.findUnique({ where: { id: existing.bookingId } });
    if (!booking) return { ok: false, error: "Booking not found" };

    const { bookingToEmailContext } = await import("./booking-context");
    // Fresh context → new PDF + new email + new EmailLog row
    const ctx = bookingToEmailContext(booking, {
      issueDate: new Date().toISOString().slice(0, 10),
    });
    const template = (existing.template || EMAIL_TEMPLATES.BOOKING_CONFIRMATION) as EmailTemplateId;
    return this.sendBookingEmail({
      template,
      ctx,
      to: existing.recipient,
      attachPdf: true,
      queue: false,
    });
  }

  async listForBooking(bookingId: number) {
    if (!isDatabaseAvailable()) return [];
    return db.emailLog.findMany({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const emailService = new EmailService();
