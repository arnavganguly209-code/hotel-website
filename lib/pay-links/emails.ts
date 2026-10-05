import {
  getHotelMailConfig,
  getHotelNotifyAddressList,
  getMailFromHeader,
  isSmtpConfigured,
} from "@/lib/email/config";
import { smtpSend } from "@/lib/email/smtp-service";
import { db, isDatabaseAvailable } from "@/lib/db";
import { formatUsdAmount, publicPayUrl } from "./money";

function esc(value: string): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(title: string, inner: string) {
  const hotel = getHotelMailConfig();
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#efe9dc;font-family:Georgia,serif;color:#14352c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fffdf8;border-radius:16px;border:1px solid #d4af37;overflow:hidden;">
        <tr>
          <td align="center" style="background:#ffffff;padding:24px;border-bottom:3px solid #c5a059;">
            <img src="${esc(hotel.logoUrl)}" alt="${esc(hotel.name)}" width="200" style="width:200px;max-width:80%;height:auto;display:block;border:0;" />
          </td>
        </tr>
        <tr>
          <td style="background:#153a2a;padding:16px 24px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#e0c184;">Hotel Thamel Park</p>
            <h1 style="margin:8px 0 0;font-size:24px;color:#ffffff;font-weight:400;">${esc(title)}</h1>
          </td>
        </tr>
        <tr><td style="padding:28px 24px;">${inner}</td></tr>
        <tr>
          <td style="padding:0 24px 24px;text-align:center;color:#6b746e;font-size:12px;">
            ${esc(hotel.address)}<br/>${esc(hotel.phone)} · ${esc(hotel.email)}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function kv(label: string, value: string) {
  return `<tr>
    <td style="padding:7px 0;color:#6b746e;font-size:13px;width:42%;">${esc(label)}</td>
    <td style="padding:7px 0;color:#14352c;font-size:14px;font-weight:600;">${value}</td>
  </tr>`;
}

function moneyRows(link: {
  amountUsd: unknown;
  subtotalAmountUsd?: unknown;
  totalAmountUsd?: unknown;
  cardFeeEnabled?: boolean;
  cardFeeAmount?: unknown;
  currency?: string;
  paidAmount?: unknown;
}) {
  const currency = link.currency || "USD";
  const base = `${formatUsdAmount(link.subtotalAmountUsd ?? link.amountUsd)} ${currency}`;
  const total = `${formatUsdAmount(link.paidAmount ?? link.totalAmountUsd ?? link.amountUsd)} ${currency}`;
  let html = kv("Amount", esc(base));
  if (link.cardFeeEnabled) {
    html += kv("Card Fee", esc(`${formatUsdAmount(link.cardFeeAmount)} ${currency}`));
  }
  html += kv("Total", `<span style="font-size:20px;color:#153a2a;">${esc(total)}</span>`);
  return { html, base, total };
}

async function send(opts: { to: string; subject: string; html: string; text: string }) {
  if (!isSmtpConfigured() || !opts.to.trim()) {
    return { ok: false as const, error: "SMTP not configured or missing recipient" };
  }
  try {
    await smtpSend({
      from: getMailFromHeader(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Send failed" };
  }
}

export async function sendPayLinkInvite(link: {
  publicToken: string;
  customerName: string;
  customerEmail: string;
  title: string;
  description: string;
  amountUsd: unknown;
  currency: string;
  cardFeeEnabled?: boolean;
  cardFeeAmount?: unknown;
  subtotalAmountUsd?: unknown;
  totalAmountUsd?: unknown;
}) {
  const payUrl = publicPayUrl(link.publicToken);
  const money = moneyRows(link);
  const html = shell(
    "Payment Request",
    `<p style="margin:0 0 16px;font-size:16px;">Dear ${esc(link.customerName)},</p>
     <p style="margin:0 0 18px;color:#3d5a4c;">Please complete your payment to Hotel Thamel Park using the secure button below.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
       ${kv("Payment", esc(link.title))}
       ${kv("Description", esc(link.description || "—"))}
       ${money.html}
       ${kv("Reference", esc(link.publicToken))}
     </table>
     <p style="margin:22px 0;text-align:center;">
       <a href="${esc(payUrl)}" style="display:inline-block;padding:14px 28px;background:#c5a059;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;letter-spacing:0.06em;">Pay Securely</a>
     </p>`
  );
  const text = [
    `Dear ${link.customerName},`,
    `Please complete your payment to Hotel Thamel Park.`,
    `Payment: ${link.title}`,
    `Amount: ${money.base}`,
    ...(link.cardFeeEnabled ? [`Card Fee: ${formatUsdAmount(link.cardFeeAmount)} ${link.currency || "USD"}`] : []),
    `Total: ${money.total}`,
    `Reference: ${link.publicToken}`,
    `Pay: ${payUrl}`,
  ].join("\n");
  return send({
    to: link.customerEmail,
    subject: `Payment Request — ${link.title} | Hotel Thamel Park`,
    html,
    text,
  });
}

export async function sendPayLinkPaidEmail(linkId: string) {
  if (!isDatabaseAvailable()) return { ok: false as const, skipped: true };
  const claimed = await db.paymentLink.updateMany({
    where: { id: linkId, paymentStatus: "PAID", successEmailSentAt: null },
    data: { successEmailSentAt: new Date() },
  });
  if (claimed.count !== 1) return { ok: true as const, skipped: true };
  const link = await db.paymentLink.findUnique({ where: { id: linkId } });
  if (!link || link.paymentStatus !== "PAID") return { ok: true as const, skipped: true };

  const money = moneyRows(link);
  const paidDate = (link.paidAt || new Date()).toISOString().slice(0, 10);
  const html = shell(
    "Payment Received",
    `<p style="margin:0 0 16px;font-size:16px;">Dear ${esc(link.customerName)},</p>
     <p style="margin:0 0 18px;color:#3d5a4c;">Thank you. Your payment has been received.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
       ${kv("Payment", esc(link.title))}
       ${kv("Description", esc(link.description || "—"))}
       ${money.html}
       ${kv("Reference", esc(link.publicToken))}
       ${kv("Date", esc(paidDate))}
       ${kv("Status", "PAID")}
     </table>`
  );
  const text = [
    `Dear ${link.customerName},`,
    `Your payment of ${money.total} has been received.`,
    `Payment: ${link.title}`,
    `Amount: ${money.base}`,
    ...(link.cardFeeEnabled ? [`Card Fee: ${formatUsdAmount(link.cardFeeAmount)} ${link.paidCurrency || "USD"}`] : []),
    `Total Paid: ${money.total}`,
    `Reference: ${link.publicToken}`,
    `Status: PAID`,
  ].join("\n");

  const recipients = [link.customerEmail, getHotelNotifyAddressList()]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
  const result = await send({
    to: recipients,
    subject: "Payment Received — Hotel Thamel Park",
    html,
    text,
  });
  if (!result.ok) {
    await db.paymentLink.update({
      where: { id: link.id },
      data: { successEmailSentAt: null },
    });
  }
  return result;
}

export async function sendPayLinkFailedEmail(linkId: string) {
  if (!isDatabaseAvailable()) return { ok: false as const, skipped: true };
  const claimed = await db.paymentLink.updateMany({
    where: { id: linkId, paymentStatus: "FAILED", failureEmailSentAt: null },
    data: { failureEmailSentAt: new Date() },
  });
  if (claimed.count !== 1) return { ok: true as const, skipped: true };
  const link = await db.paymentLink.findUnique({ where: { id: linkId } });
  if (!link || link.paymentStatus === "PAID") return { ok: true as const, skipped: true };

  const money = moneyRows(link);
  const html = shell(
    "Payment Unsuccessful",
    `<p style="margin:0 0 16px;font-size:16px;">Dear ${esc(link.customerName)},</p>
     <p style="margin:0 0 18px;color:#3d5a4c;">We could not complete your payment. You may try again using the original payment link, or contact Hotel Thamel Park.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
       ${kv("Payment", esc(link.title))}
       ${money.html}
       ${kv("Reference", esc(link.publicToken))}
       ${kv("Status", "PAYMENT FAILED")}
     </table>
     <p style="margin:22px 0;text-align:center;">
       <a href="${esc(publicPayUrl(link.publicToken))}" style="display:inline-block;padding:14px 28px;background:#c5a059;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">Try again</a>
     </p>`
  );
  const recipients = [link.customerEmail, getHotelNotifyAddressList()]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
  if (!recipients) {
    await db.paymentLink.update({
      where: { id: link.id },
      data: { failureEmailSentAt: null },
    });
    return { ok: true as const, skipped: true };
  }
  const result = await send({
    to: recipients,
    subject: "Payment Unsuccessful — Hotel Thamel Park",
    html,
    text: `Dear ${link.customerName}, we could not complete your payment of ${money.total}. Reference ${link.publicToken}.`,
  });
  if (!result.ok) {
    await db.paymentLink.update({
      where: { id: link.id },
      data: { failureEmailSentAt: null },
    });
  }
  return result;
}
