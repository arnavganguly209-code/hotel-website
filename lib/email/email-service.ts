import { db, isDatabaseAvailable } from "@/lib/db";
import fs from "fs";
import path from "path";
import { formatBookingNumber } from "@/lib/booking/booking-number";
import {
  EMAIL_TEMPLATES,
  SMTP_MAX_RETRIES,
  getBookingNotifyEmail,
  getBookingPdfUrl,
  getMailFromHeader,
  getHotelMailConfig,
  isSmtpConfigured,
  type EmailTemplateId,
} from "./config";
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

function logStep(step: string, detail?: Record<string, unknown>) {
  if (detail) {
    console.info(`[email] ${step}`, detail);
  } else {
    console.info(`[email] ${step}`);
  }
}

function loadEmailLogoBuffer(): Buffer | null {
  const candidates = [
    path.join(process.cwd(), "public", "brand", "email-logo.png"),
    path.join(process.cwd(), "public", "brand", "admin-login-logo.png"),
    path.join(process.cwd(), "public", "brand", "pdf-logo.png"),
    path.join(process.cwd(), "public", "brand", "thamelpark-logo.png"),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        const buf = fs.readFileSync(file);
        if (buf.length > 0) {
          console.info("[email] Loaded logo for CID embed", { file, bytes: buf.length });
          return buf;
        }
      }
    } catch (err) {
      console.error(
        "[email] Logo read failed:",
        file,
        err instanceof Error ? err.message : err
      );
    }
  }
  console.error("[email] No logo file found for CID embed — falling back to absolute URL");
  return null;
}

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
    console.error(
      "[email] Failed to create EmailLog (email will still send):",
      err instanceof Error ? err.stack || err.message : err
    );
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
    console.error(
      "[email] Failed to update EmailLog:",
      err instanceof Error ? err.stack || err.message : err
    );
  }
}

/**
 * Core EmailService — templates, PDF (non-blocking), SMTP send, logging.
 * Booking confirmation emails are sent immediately (not deferred to a background queue)
 * so delivery completes before the booking API returns.
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
  }): Promise<SendEmailResult> {
    const bookingId = opts.ctx.bookingId;
    logStep("Preparing email", {
      bookingId,
      template: opts.template,
      to: opts.to,
      attachPdf: Boolean(opts.attachPdf),
    });

    if (!opts.to?.trim()) {
      const error = "Missing recipient email address";
      console.error("[email]", error);
      return { ok: false, error };
    }

    if (!isSmtpConfigured()) {
      const error = "SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASSWORD)";
      console.error("[email]", error);
      return { ok: false, error };
    }

    const logoBuf = loadEmailLogoBuffer();
    const ctxWithLogo: BookingEmailContext = {
      ...opts.ctx,
      pdfUrl:
        opts.ctx.pdfUrl && /^https?:\/\//i.test(opts.ctx.pdfUrl)
          ? opts.ctx.pdfUrl
          : getBookingPdfUrl(opts.ctx.bookingId, opts.ctx.guestEmail),
      useCidLogo: false,
    };

    let rendered;
    try {
      rendered = renderBookingEmail(opts.template, ctxWithLogo);
    } catch (err) {
      console.error(
        "[email] Template render failed:",
        err instanceof Error ? err.stack || err.message : err
      );
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Template render failed",
      };
    }

    const log = await createLog({
      bookingId,
      recipient: opts.to,
      subject: rendered.subject,
      template: opts.template,
      status: "sending",
      meta: {
        attachPdf: Boolean(opts.attachPdf),
        logoUrl: getHotelMailConfig().logoUrl,
        pdfUrl: ctxWithLogo.pdfUrl,
        logoOnDisk: Boolean(logoBuf),
      },
    });

    let attempts = 0;
    let lastError = "";

    while (attempts < SMTP_MAX_RETRIES) {
      attempts += 1;
      try {
        await updateLog(log?.id, { status: "sending", retryCount: attempts });

        type MailAttachment = {
          filename: string;
          content: Buffer;
          contentType?: string;
          cid?: string;
          contentDisposition?: "attachment" | "inline";
        };
        const attachments: MailAttachment[] = [];

        // PDF only — logo is loaded via absolute HTTPS URL in HTML (avoids CID/PDF multipart issues).
        if (opts.attachPdf) {
          logStep("Generating PDF attachment", { bookingId, attempt: attempts });
          try {
            const pdf = await buildReservationPdf(ctxWithLogo);
            attachments.push({
              filename: `Booking-${ctxWithLogo.bookingNumber || formatBookingNumber(bookingId)}.pdf`,
              content: pdf,
              contentType: "application/pdf",
              contentDisposition: "attachment",
            });
            logStep("PDF generated successfully", {
              bookingId,
              bytes: pdf.length,
            });
          } catch (pdfErr) {
            console.error(
              "[email] PDF generation failed — sending email without attachment:",
              pdfErr instanceof Error ? pdfErr.stack || pdfErr.message : pdfErr
            );
          }
        }

        const hotel = getHotelMailConfig();
        logStep("Calling sendMail()", {
          bookingId,
          to: opts.to,
          subject: rendered.subject,
          hasPdf: attachments.some((a) => a.contentType === "application/pdf"),
          logoUrl: hotel.logoUrl,
          pdfUrl: ctxWithLogo.pdfUrl,
          attempt: attempts,
        });

        const info = await smtpSend({
          from: getMailFromHeader(),
          to: opts.to,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
          replyTo: hotel.email,
          attachments: attachments.length ? attachments : undefined,
        });

        await updateLog(log?.id, {
          status: "sent",
          smtpResponse: `${info.messageId} | ${info.response}`.slice(0, 500),
          error: "",
          sentAt: new Date(),
          deliveredAt: new Date(),
          retryCount: attempts,
        });

        logStep("Email sent successfully", {
          bookingId,
          to: opts.to,
          template: opts.template,
          messageId: info.messageId,
          response: info.response,
        });

        return { ok: true, logId: log?.id, messageId: info.messageId };
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Send failed";
        console.error(
          `[email] sendMail failed (attempt ${attempts}/${SMTP_MAX_RETRIES}):`,
          err instanceof Error ? err.stack || err.message : err
        );
        if (attempts < SMTP_MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 700 * attempts));
        }
      }
    }

    await updateLog(log?.id, {
      status: "failed",
      error: lastError.slice(0, 1000),
      retryCount: attempts,
    });
    return { ok: false, logId: log?.id, error: lastError };
  }

  /** Guest confirmation + hotel notification. Awaits both sends. */
  async sendNewBookingPair(ctx: BookingEmailContext): Promise<{
    guest: SendEmailResult;
    hotel: SendEmailResult;
  }> {
    const adminTo = getBookingNotifyEmail();
    logStep("Preparing customer email", {
      bookingId: ctx.bookingId,
      to: ctx.guestEmail,
    });
    logStep("Preparing admin email", {
      bookingId: ctx.bookingId,
      to: adminTo,
    });

    const guest = await this.sendBookingEmail({
      template: EMAIL_TEMPLATES.BOOKING_CONFIRMATION,
      ctx,
      to: ctx.guestEmail,
      attachPdf: true,
    });
    if (guest.ok) {
      logStep("Customer email sent", { bookingId: ctx.bookingId, to: ctx.guestEmail });
    } else {
      console.error("[email] Customer email FAILED", {
        bookingId: ctx.bookingId,
        error: guest.error,
      });
    }

    const hotel = await this.sendBookingEmail({
      template: EMAIL_TEMPLATES.HOTEL_NEW_BOOKING,
      ctx,
      to: adminTo,
      attachPdf: true,
    });
    if (hotel.ok) {
      logStep("Admin email sent", { bookingId: ctx.bookingId, to: adminTo });
    } else {
      console.error("[email] Admin email FAILED", {
        bookingId: ctx.bookingId,
        error: hotel.error,
      });
    }

    logStep("Booking email workflow completed", {
      bookingId: ctx.bookingId,
      guestOk: guest.ok,
      hotelOk: hotel.ok,
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
    const ctx = bookingToEmailContext(booking, {
      issueDate: new Date().toISOString().slice(0, 10),
    });
    const template = (existing.template || EMAIL_TEMPLATES.BOOKING_CONFIRMATION) as EmailTemplateId;
    return this.sendBookingEmail({
      template,
      ctx,
      to: existing.recipient,
      attachPdf: true,
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
