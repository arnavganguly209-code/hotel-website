import { cookies } from "next/headers";
import { db, isDatabaseAvailable } from "@/lib/db";
import {
  createPrePaymentUi,
  getPacoConfig,
  inquireTransaction,
  isPacoConfigured,
  parseInquiryOutcome,
  pacoLog,
} from "@/lib/payments/paco";
import { canCollectPayment, normalizeUsdAmount } from "./money";

const COOKIE = "hbl_paylink_order";

export function payLinkOrderCookie(orderNo: string) {
  return {
    name: COOKIE,
    value: orderNo,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 6,
    secure: process.env.COOKIE_SECURE === "true" || (process.env.SITE_URL || "").startsWith("https"),
  };
}

export async function readPayLinkOrderCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value || null;
}

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://hotelthamelpark.com").replace(
    /\/$/,
    ""
  );
}

/**
 * Start HBL PACO for a payment link using DB amount only.
 * Does not write Booking / PaymentTransaction rows.
 */
export async function initiatePayLinkPayment(opts: {
  token: string;
  ip?: string;
  userAgent?: string;
}) {
  if (!isDatabaseAvailable()) {
    return { ok: false as const, error: "Database not configured", status: 503 };
  }
  if (!isPacoConfigured()) {
    return {
      ok: false as const,
      error: "Online payment is temporarily unavailable. Please try again later.",
      status: 503,
    };
  }

  const token = opts.token.trim().toUpperCase();
  const link = await db.paymentLink.findUnique({ where: { publicToken: token } });
  if (!link) return { ok: false as const, error: "Payment link not found", status: 404 };

  if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
    if (link.paymentStatus !== "EXPIRED") {
      await db.paymentLink.update({
        where: { id: link.id },
        data: { paymentStatus: "EXPIRED", status: "EXPIRED" },
      });
    }
    return { ok: false as const, error: "This payment link has expired.", status: 410 };
  }

  if (!canCollectPayment(link.paymentStatus, link.expiresAt)) {
    if (link.paymentStatus === "PAID") {
      return { ok: false as const, error: "This payment has already been completed.", status: 409 };
    }
    return { ok: false as const, error: "This payment link is no longer active.", status: 409 };
  }

  const amount = normalizeUsdAmount(link.amountUsd);
  if (!amount || link.currency !== "USD") {
    return { ok: false as const, error: "Invalid payment amount.", status: 400 };
  }

  const paco = getPacoConfig();
  const base = paco.siteUrl || siteBase();
  let payment: Awaited<ReturnType<typeof createPrePaymentUi>>;
  try {
    payment = await createPrePaymentUi({
      amount,
      currency: "USD",
      productDescription: `Pay link ${link.publicToken} — ${link.title}`.slice(0, 240),
      bookingId: 0,
      bookingNumber: link.publicToken,
      browserIp: opts.ip || "0.0.0.0",
      browserUserAgent: opts.userAgent || "",
      successUrl: `${base}/api/pay-links/hbl/success`,
      failedUrl: `${base}/api/pay-links/hbl/failed`,
      cancelUrl: `${base}/api/pay-links/hbl/cancel`,
      backendUrl: `${base}/api/pay-links/hbl/callback`,
    });
  } catch (err) {
    pacoLog("error", "paylink_payment_init_failed", {
      token: link.publicToken,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      ok: false as const,
      error: "Unable to start payment. Please try again.",
      status: 502,
    };
  }

  await db.paymentLinkAttempt.create({
    data: {
      paymentLinkId: link.id,
      orderNo: payment.orderNo,
      amount,
      currency: "USD",
      status: "redirected",
      paymentPageUrl: payment.paymentPageURL,
    },
  });

  await db.paymentLink.update({
    where: { id: link.id },
    data: {
      pacoOrderNo: payment.orderNo,
      paymentStatus: "PENDING",
      status: "PENDING",
      lastError: "",
    },
  });

  pacoLog("info", "paylink_payment_init", {
    token: link.publicToken,
    orderNo: payment.orderNo,
    amount,
    currency: "USD",
  });

  return {
    ok: true as const,
    paymentPageURL: payment.paymentPageURL,
    orderNo: payment.orderNo,
    token: link.publicToken,
  };
}

export function normalizePayLinkOrderNo(value: string | null | undefined): string {
  return String(value || "").trim();
}

export async function syncPayLinkFromInquiry(
  orderNoRaw: string,
  source: "callback" | "success" | "failed" | "cancel"
) {
  if (!isDatabaseAvailable()) {
    return { ok: false as const, error: "Database not configured" };
  }

  const orderNo = normalizePayLinkOrderNo(orderNoRaw);
  const attempt = await db.paymentLinkAttempt.findUnique({
    where: { orderNo },
    include: { paymentLink: true },
  });
  if (!attempt) {
    pacoLog("warn", "paylink_unknown_order", { orderNo, source });
    return { ok: false as const, error: "Unknown pay-link order" };
  }

  const link = attempt.paymentLink;
  if (link.paymentStatus === "PAID") {
    return { ok: true as const, alreadyPaid: true, paid: true, token: link.publicToken, linkId: link.id };
  }

  let inquiry: Record<string, unknown>;
  try {
    inquiry = await inquireTransaction(orderNo);
  } catch (err) {
    pacoLog("error", "paylink_inquiry_failed", {
      orderNo,
      source,
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false as const, error: "Inquiry failed", token: link.publicToken };
  }

  const outcome = parseInquiryOutcome(inquiry);
  const expectedAmount = Number(attempt.amount);
  const inquiryAmount = outcome.amount;
  const inquiryCurrency = String(outcome.currency || "").toUpperCase();
  const amountMismatch =
    typeof inquiryAmount === "number" &&
    Number.isFinite(expectedAmount) &&
    Math.round(inquiryAmount * 100) !== Math.round(expectedAmount * 100);
  const currencyMismatch = inquiryCurrency && inquiryCurrency !== "USD";

  if (outcome.paid && (amountMismatch || currencyMismatch)) {
    pacoLog("error", "paylink_inquiry_money_mismatch", {
      orderNo,
      expectedAmount,
      inquiryAmount,
      inquiryCurrency,
    });
    await db.paymentLink.update({
      where: { id: link.id },
      data: {
        lastError: "Gateway amount/currency mismatch",
        rawInquiry: inquiry as object,
      },
    });
    return { ok: false as const, error: "Amount mismatch", token: link.publicToken };
  }

  if (outcome.paid) {
    await db.paymentLinkAttempt.update({
      where: { id: attempt.id },
      data: { status: "paid" },
    });
    const updated = await db.paymentLink.update({
      where: { id: link.id },
      data: {
        paymentStatus: "PAID",
        status: "PAID",
        paidAt: new Date(),
        paidAmount: typeof inquiryAmount === "number" ? inquiryAmount : expectedAmount,
        paidCurrency: "USD",
        gatewayTxnId: outcome.invoiceNo || orderNo,
        gatewayReference: outcome.approvalCode || orderNo,
        pacoOrderNo: orderNo,
        rawInquiry: inquiry as object,
        lastError: "",
      },
    });
    return { ok: true as const, paid: true, token: updated.publicToken, linkId: updated.id };
  }

  if (outcome.failed) {
    await db.paymentLinkAttempt.update({
      where: { id: attempt.id },
      data: { status: "failed" },
    });
    await db.paymentLink.update({
      where: { id: link.id },
      data: {
        paymentStatus: "FAILED",
        status: "FAILED",
        failedAt: new Date(),
        rawInquiry: inquiry as object,
      },
    });
    return { ok: true as const, paid: false, failed: true, token: link.publicToken, linkId: link.id };
  }

  if (source === "cancel") {
    await db.paymentLinkAttempt.update({
      where: { id: attempt.id },
      data: { status: "cancelled" },
    });
    await db.paymentLink.update({
      where: { id: link.id },
      data: {
        paymentStatus: "PENDING",
        status: "PENDING",
        rawInquiry: inquiry as object,
      },
    });
    return { ok: true as const, paid: false, cancelled: true, token: link.publicToken };
  }

  await db.paymentLink.update({
    where: { id: link.id },
    data: {
      paymentStatus: "PROCESSING",
      status: "PROCESSING",
      rawInquiry: inquiry as object,
    },
  });
  return { ok: true as const, paid: false, token: link.publicToken };
}
