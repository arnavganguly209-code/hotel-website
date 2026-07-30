import { formatUsd, formatVatPercent } from "@/lib/booking/vat";
import { formatBookingNumber } from "@/lib/booking/booking-number";
import {
  getAdminDashboardUrl,
  getBookingPdfUrl,
  getHotelMailConfig,
  type EmailTemplateId,
} from "./config";

export type BookingEmailContext = {
  bookingId: number;
  /** Display code e.g. HTP01001 */
  bookingNumber?: string;
  bookingDate: string;
  issueDate?: string;
  bookingStatus: string;
  paymentStatus: string;
  reservationSource?: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestCountry: string;
  nationality?: string;
  passportNumber?: string;
  roomName: string;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  roomQuantity: number;
  mealPlan?: string;
  specialRequests: string;
  displayPrice: number;
  basePrice: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  currency: string;
  paymentMethod?: string;
  bookingTime?: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  voucherUrl?: string;
  pdfUrl?: string;
  /** When true, templates use cid:htp-logo (inline attachment). */
  useCidLogo?: boolean;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
  template: EmailTemplateId;
};

export const EMAIL_LOGO_CID = "htp-logo@hotelthamelpark";

function esc(value: string): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n: number) {
  return formatUsd(Number(n) || 0);
}

function whatsappLink(raw: string): string {
  return `https://wa.me/${raw.replace(/\D/g, "")}`;
}

function statusBadge(status: string): string {
  const s = (status || "").toLowerCase();
  let bg = "#fef3c7";
  let fg = "#92400e";
  let label = status.replace(/_/g, " ") || "—";
  if (s.includes("confirm") || s === "paid" || s === "checked_in" || s === "offline") {
    bg = "#d1fae5";
    fg = "#065f46";
  } else if (s.includes("cancel") || s.includes("refund")) {
    bg = "#fee2e2";
    fg = "#991b1b";
  } else if (s.includes("pending") || s.includes("await") || s === "unpaid") {
    bg = "#fef3c7";
    fg = "#92400e";
  }
  return `<span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${bg};color:${fg};font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">${esc(label)}</span>`;
}

function card(title: string, inner: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#ffffff;border:1px solid #e8d9b0;border-radius:14px;box-shadow:0 8px 28px rgba(21,58,42,0.06);">
    <tr>
      <td style="padding:18px 20px 6px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c5a059;font-weight:700;">${esc(title)}</p>
      </td>
    </tr>
    <tr><td style="padding:4px 20px 18px;">${inner}</td></tr>
  </table>`;
}

function kv(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:7px 0;width:42%;font-size:13px;color:#6b746e;vertical-align:top;">${esc(label)}</td>
    <td style="padding:7px 0;font-size:14px;color:#14352c;font-weight:600;vertical-align:top;">${value}</td>
  </tr>`;
}

function btn(href: string, label: string, style: "gold" | "green" | "outline" | "wa" = "gold"): string {
  const styles = {
    gold: "background:#c5a059;color:#ffffff;",
    green: "background:#153a2a;color:#f5e7c0;",
    outline: "background:#ffffff;color:#153a2a;border:1px solid #c5a059;",
    wa: "background:#25D366;color:#ffffff;",
  }[style];
  return `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.06em;${styles}">${esc(label)}</a>`;
}

function bookingNo(ctx: BookingEmailContext): string {
  return ctx.bookingNumber || formatBookingNumber(ctx.bookingId);
}

function logoMarkup(_useCid?: boolean): string {
  const hotel = getHotelMailConfig();
  // Full Hotel Thamel Park & Spa mark (name is inside the logo).
  return `<img src="${esc(hotel.logoUrl)}" alt="${esc(hotel.name)}" width="220" style="width:220px;max-width:88%;height:auto;display:block;margin:0 auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" />`;
}

function pdfDownloadUrl(ctx: BookingEmailContext): string {
  if (ctx.pdfUrl && /^https?:\/\//i.test(ctx.pdfUrl)) return ctx.pdfUrl;
  return getBookingPdfUrl(ctx.bookingId, ctx.guestEmail);
}

function luxuryShell(opts: {
  preheader: string;
  eyebrow: string;
  title: string;
  bodyHtml: string;
  useCidLogo?: boolean;
}): string {
  const hotel = getHotelMailConfig();
  const year = new Date().getFullYear();
  const logo = logoMarkup(opts.useCidLogo);
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${esc(opts.title)}</title>
  <!--[if mso]><style>body,table,td{font-family:Georgia,serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#efe9dc;font-family:Georgia,'Times New Roman',serif;color:#14352c;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efe9dc;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#fffdf8;border-radius:18px;overflow:hidden;border:1px solid #d4af37;box-shadow:0 18px 50px rgba(21,58,42,0.12);">
        <!-- Logo: absolute HTTPS URL (never relative / localhost) + optional CID -->
        <tr>
          <td align="center" style="background:#ffffff;padding:28px 24px 18px;border-bottom:3px solid #c5a059;">
            ${logo}
          </td>
        </tr>
        <tr>
          <td style="background:#153a2a;padding:18px 24px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#e0c184;">${esc(opts.eyebrow)}</p>
            <h1 style="margin:10px 0 0;font-size:26px;line-height:1.3;font-weight:400;color:#ffffff;">${esc(opts.title)}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 24px 8px;">
            ${opts.bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 24px 28px;border-top:1px solid #e8d9b0;text-align:center;">
            <p style="margin:16px 0 6px;font-size:13px;line-height:1.7;color:#5a635c;">
              ${esc(hotel.address)}<br/>
              ${esc(hotel.phone)} · ${esc(hotel.email)}<br/>
              <a href="${esc(hotel.website)}" style="color:#9e7738;text-decoration:none;">${esc(hotel.website)}</a>
            </p>
            <p style="margin:14px 0 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#a47e3e;">
              © ${year} ${esc(hotel.name)}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function guestCards(ctx: BookingEmailContext): string {
  const hotel = getHotelMailConfig();
  const wa = whatsappLink(hotel.whatsapp);
  const pdfHref = pdfDownloadUrl(ctx);

  const bookingCard = card(
    "Booking Details",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${kv("Booking No", esc(bookingNo(ctx)))}
      ${kv("Booking Date", esc(ctx.bookingDate))}
      ${kv("Booking Status", statusBadge(ctx.bookingStatus))}
      ${kv("Payment Status", statusBadge(ctx.paymentStatus))}
    </table>`
  );

  const stayCard = card(
    "Stay Details",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${kv("Room Type", esc(ctx.roomName))}
      ${kv("Check In", esc(ctx.checkIn))}
      ${kv("Check Out", esc(ctx.checkOut))}
      ${kv("Nights", String(ctx.nights))}
      ${kv("Adults", String(ctx.adults))}
      ${kv("Children", String(ctx.children))}
      ${kv("Meal Plan", esc(ctx.mealPlan || "Breakfast Included"))}
      ${kv("Special Requests", esc(ctx.specialRequests || "—"))}
    </table>`
  );

  const paymentCard = card(
    "Payment Summary",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${kv("Website Price (VAT Included)", `<span style="color:#153a2a;">${money(ctx.displayPrice)}</span>`)}
      ${kv("Room Charge", money(ctx.basePrice))}
      ${kv(`VAT (${formatVatPercent(ctx.vatRate || 0.13)})`, money(ctx.vatAmount))}
      ${kv("Grand Total", `<span style="font-size:18px;color:#153a2a;">${money(ctx.grandTotal)} ${esc(ctx.currency || "USD")}</span>`)}
    </table>
    <p style="margin:10px 0 0;font-size:12px;color:#6b746e;">Website rates are VAT inclusive — VAT is not added again.</p>`
  );

  const contactCard = card(
    "Contact Hotel",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${kv("Phone", esc(hotel.phone))}
      ${kv("Email", esc(hotel.email))}
      ${kv("Website", `<a href="${esc(hotel.website)}" style="color:#9e7738;">${esc(hotel.website)}</a>`)}
    </table>
    <div style="margin-top:14px;">
      ${btn(hotel.googleMap, "Open Google Maps", "green")}
      ${btn(wa, "WhatsApp", "wa")}
    </div>`
  );

  const buttons = `
    <div style="margin:8px 0 12px;text-align:center;">
      ${btn(pdfHref, "Download Booking PDF", "gold")}
    </div>
    <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#5a635c;text-align:center;">
    Your voucher is also attached as <strong>Booking-${bookingNo(ctx)}.pdf</strong>.<br/>
      Open that attachment to save the PDF — do not use the website homepage.
    </p>
    <div style="margin:0 0 20px;text-align:center;">
      ${btn(hotel.website, "Visit Website", "outline")}
      ${btn(`mailto:${hotel.email}`, "Contact Hotel", "green")}
    </div>`;

  return bookingCard + stayCard + paymentCard + contactCard + buttons;
}

function guestIntro(ctx: BookingEmailContext, message: string): string {
  return `
    <p style="margin:0 0 12px;font-size:16px;line-height:1.7;">Dear ${esc(ctx.guestName)},</p>
    <p style="margin:0 0 10px;font-size:15px;line-height:1.75;color:#3d5a4c;">Thank you for choosing Hotel Thamel Park.</p>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.75;color:#3d5a4c;">${esc(message)}</p>
    <p style="margin:0 0 18px;font-size:14px;color:#6b746e;">Below are your booking details.</p>
    ${guestCards(ctx)}
    <p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#5a635c;text-align:center;">
      Thank you for choosing Hotel Thamel Park.<br/>We look forward to welcoming you.
    </p>`;
}

function paymentSummaryText(ctx: BookingEmailContext): string {
  return [
    `Website Price (VAT Included): ${money(ctx.displayPrice)}`,
    `Room Charge: ${money(ctx.basePrice)}`,
    `VAT (${formatVatPercent(ctx.vatRate || 0.13)}): ${money(ctx.vatAmount)}`,
    `Grand Total: ${money(ctx.grandTotal)} ${ctx.currency || "USD"}`,
  ].join("\n");
}

function guestText(ctx: BookingEmailContext, message: string, hotelName: string): string {
  return [
    `Dear ${ctx.guestName},`,
    "",
    `Thank you for choosing ${hotelName}.`,
    message,
    "",
    `Booking No: ${bookingNo(ctx)}`,
    `Download PDF: ${pdfDownloadUrl(ctx)}`,
    "",
    paymentSummaryText(ctx),
    "",
    `Thank you for choosing ${hotelName}.`,
  ].join("\n");
}

function adminDashboardHtml(ctx: BookingEmailContext): string {
  const hotel = getHotelMailConfig();
  const adminUrl = getAdminDashboardUrl();
  const pdfHref = pdfDownloadUrl(ctx);
  return luxuryShell({
    preheader: `New booking ${bookingNo(ctx)} — ${ctx.guestName}`,
    eyebrow: "Reservations Desk",
    title: "New Booking Received",
    useCidLogo: ctx.useCidLogo,
    bodyHtml: `
      <p style="margin:0 0 18px;font-size:14px;color:#5a635c;">Internal hotel notification — review and confirm this reservation.</p>
      ${card(
        "Reservation Snapshot",
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${kv("Booking No", esc(bookingNo(ctx)))}
          ${kv("Booking Status", statusBadge(ctx.bookingStatus))}
          ${kv("Payment Status", statusBadge(ctx.paymentStatus))}
          ${kv("Guest Name", esc(ctx.guestName))}
          ${kv("Phone", esc(ctx.guestPhone || "—"))}
          ${kv("Email", esc(ctx.guestEmail))}
          ${kv("Country", esc(ctx.guestCountry || "—"))}
          ${kv("Room", esc(ctx.roomName))}
          ${kv("Arrival", esc(ctx.checkIn))}
          ${kv("Departure", esc(ctx.checkOut))}
          ${kv("Adults", String(ctx.adults))}
          ${kv("Children", String(ctx.children))}
          ${kv("Special Request", esc(ctx.specialRequests || "—"))}
          ${kv("Room Charge", money(ctx.basePrice))}
          ${kv("VAT", money(ctx.vatAmount))}
          ${kv("Grand Total", `<strong>${money(ctx.grandTotal)} ${esc(ctx.currency || "USD")}</strong>`)}
          ${kv("Booking Time", esc(ctx.bookingTime || ctx.bookingDate))}
          ${kv("IP Address", esc(ctx.ipAddress || "—"))}
          ${kv("Browser", esc((ctx.userAgent || "—").slice(0, 120)))}
          ${kv("Device", esc(ctx.device || "—"))}
        </table>`
      )}
      <div style="margin-top:8px;text-align:center;">
        ${btn(adminUrl, "Open Admin Bookings", "green")}
        ${btn(pdfHref, "Download Booking PDF", "gold")}
      </div>
      <p style="margin:16px 0 0;font-size:12px;color:#6b746e;text-align:center;">
        Reservation PDF is also attached to this message when available.<br/>
        ${esc(hotel.website)}
      </p>
    `,
  });
}

/** Render guest / hotel booking email templates (premium HTML). */
export function renderBookingEmail(
  template: EmailTemplateId,
  ctx: BookingEmailContext
): RenderedEmail {
  const hotel = getHotelMailConfig();
  const withPdf = {
    ...ctx,
    pdfUrl:
      ctx.pdfUrl && /^https?:\/\//i.test(ctx.pdfUrl)
        ? ctx.pdfUrl
        : getBookingPdfUrl(ctx.bookingId, ctx.guestEmail),
    // Honor sender: CID when logo file was embedded; otherwise absolute HTTPS.
    useCidLogo: Boolean(ctx.useCidLogo),
  };

  const code = bookingNo(withPdf);

  if (template === "hotel_new_booking") {
    return {
      template,
      subject: `New Booking Received | ${code}`,
      html: adminDashboardHtml(withPdf),
      text: [
        `New Booking ${code}`,
        `Guest: ${ctx.guestName}`,
        `Download PDF: ${pdfDownloadUrl(withPdf)}`,
        `Admin: ${getAdminDashboardUrl()}`,
        `Grand Total: ${money(ctx.grandTotal)} ${ctx.currency || "USD"}`,
      ].join("\n"),
    };
  }

  const map: Record<string, { subject: string; message: string; title?: string }> = {
    booking_confirmation: {
      subject: `Booking Confirmation | ${code} | ${hotel.name}`,
      title: "Booking Confirmed",
      message: "Your reservation has been successfully received.",
    },
    booking_pending: {
      subject: `Booking Pending | ${code} | ${hotel.name}`,
      message: `Your booking ${code} is currently pending confirmation.`,
    },
    booking_confirmed: {
      subject: `Booking Confirmed | ${code} | ${hotel.name}`,
      message: `Your reservation ${code} is confirmed. We look forward to hosting you.`,
    },
    booking_modified: {
      subject: `Booking Updated | ${code} | ${hotel.name}`,
      message: `Your booking ${code} has been updated. Please review the details below.`,
    },
    booking_cancelled: {
      subject: `Booking Cancelled | ${code} | ${hotel.name}`,
      message: `Your booking ${code} has been cancelled. Contact us if this was unexpected.`,
    },
    payment_received: {
      subject: `Payment Received | ${code} | ${hotel.name}`,
      message: `We have received payment for booking ${code}. Thank you.`,
    },
    checkin_reminder: {
      subject: `Check-in Reminder | ${code} | ${hotel.name}`,
      message: `This is a friendly reminder that your check-in is on ${ctx.checkIn} at ${hotel.checkInTime}.`,
    },
    checkout_thankyou: {
      subject: `Thank You for Staying | ${hotel.name}`,
      message: `Thank you for staying with us. We hope you enjoyed your time at ${hotel.name}.`,
    },
    review_request: {
      subject: `Share Your Experience | ${hotel.name}`,
      message: "We would be grateful if you shared a short review of your stay.",
    },
  };

  const entry = map[template] || map.booking_confirmation;
  return {
    template,
    subject: entry.subject,
    html: luxuryShell({
      preheader: entry.subject,
      eyebrow: "Booking Confirmation",
      title: entry.title || entry.subject.split("|")[0].trim(),
      bodyHtml: guestIntro(withPdf, entry.message),
      useCidLogo: withPdf.useCidLogo,
    }),
    text: guestText(withPdf, entry.message, hotel.name),
  };
}

export function previewBookingEmailHtml(
  template: EmailTemplateId,
  ctx: BookingEmailContext
): string {
  return renderBookingEmail(template, { ...ctx, useCidLogo: false }).html;
}
