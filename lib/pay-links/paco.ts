import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { db, isDatabaseAvailable } from "@/lib/db";
import {
  createPrePaymentUi,
  getPacoConfig,
  inquireTransaction,
  isPacoConfigured,
  parseInquiryOutcome,
  pacoLog,
} from "@/lib/payments/paco";
import {
  ACTIVE_PAY_LINK_ATTEMPT_STATUSES,
  canCollectPayment,
  centsToMajorNumber,
  centsToUsdString,
  decimalToCents,
  inquiryMayMarkPaid,
} from "./money";

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

function linkTotalCents(link: { totalAmountUsd: unknown; amountUsd: unknown }): number | null {
  return decimalToCents(link.totalAmountUsd) ?? decimalToCents(link.amountUsd);
}

/**
 * Start HBL PACO for a payment link using DB customer total only.
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

  return db.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "PaymentLink" WHERE "publicToken" = ${token} FOR UPDATE
    `;
    if (!rows[0]) return { ok: false as const, error: "Payment link not found", status: 404 };

    const link = await tx.paymentLink.findUnique({ where: { id: rows[0].id } });
    if (!link) return { ok: false as const, error: "Payment link not found", status: 404 };

    if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
      if (link.paymentStatus !== "EXPIRED") {
        await tx.paymentLink.update({
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

    const active = await tx.paymentLinkAttempt.findFirst({
      where: {
        paymentLinkId: link.id,
        status: { in: [...ACTIVE_PAY_LINK_ATTEMPT_STATUSES] },
      },
      orderBy: { createdAt: "desc" },
    });
    if (active?.paymentPageUrl) {
      return {
        ok: true as const,
        paymentPageURL: active.paymentPageUrl,
        orderNo: active.orderNo,
        token: link.publicToken,
        reused: true,
      };
    }

    const totalCents = linkTotalCents(link);
    const quoteCheck = decimalToCents(link.subtotalAmountUsd);
    if (
      totalCents == null ||
      link.currency !== "USD" ||
      quoteCheck == null ||
      quoteCheck + (decimalToCents(link.cardFeeAmount) ?? 0) !== totalCents
    ) {
      return { ok: false as const, error: "Invalid payment amount.", status: 400 };
    }

    const amount = centsToMajorNumber(totalCents);
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

    try {
      await tx.paymentLinkAttempt.create({
        data: {
          paymentLinkId: link.id,
          orderNo: payment.orderNo,
          amount: new Prisma.Decimal(centsToUsdString(totalCents)),
          currency: "USD",
          status: "redirected",
          paymentPageUrl: payment.paymentPageURL,
        },
      });
    } catch (err) {
      const existing = await tx.paymentLinkAttempt.findFirst({
        where: {
          paymentLinkId: link.id,
          status: { in: [...ACTIVE_PAY_LINK_ATTEMPT_STATUSES] },
        },
      });
      if (existing?.paymentPageUrl) {
        return {
          ok: true as const,
          paymentPageURL: existing.paymentPageUrl,
          orderNo: existing.orderNo,
          token: link.publicToken,
          reused: true,
        };
      }
      throw err;
    }

    await tx.paymentLink.update({
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
  });
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
  if (link.paymentStatus === "CANCELLED" || link.paymentStatus === "EXPIRED") {
    return { ok: false as const, error: "This payment link is no longer active.", token: link.publicToken };
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
  const paidCheck = inquiryMayMarkPaid({
    outcomePaid: outcome.paid,
    inquiryAmount: outcome.amount,
    inquiryCurrency: outcome.currency,
    attemptAmount: attempt.amount,
    linkTotal: link.totalAmountUsd,
  });

  if (outcome.paid && !paidCheck.ok) {
    pacoLog("error", "paylink_inquiry_money_rejected", {
      orderNo,
      reason: paidCheck.reason,
      inquiryAmount: outcome.amount,
      inquiryCurrency: outcome.currency,
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

  if (paidCheck.ok) {
    await db.paymentLinkAttempt.update({
      where: { id: attempt.id },
      data: { status: "paid" },
    });
    const paidRows = await db.paymentLink.updateMany({
      where: { id: link.id, paymentStatus: { not: "PAID" } },
      data: {
        paymentStatus: "PAID",
        status: "PAID",
        paidAt: new Date(),
        paidAmount: new Prisma.Decimal(centsToUsdString(paidCheck.inquiryCents)),
        paidCurrency: "USD",
        gatewayTxnId: outcome.invoiceNo || orderNo,
        gatewayReference: outcome.approvalCode || orderNo,
        pacoOrderNo: orderNo,
        rawInquiry: inquiry as object,
        lastError: "",
      },
    });
    if (paidRows.count === 0) {
      return { ok: true as const, alreadyPaid: true, paid: true, token: link.publicToken, linkId: link.id };
    }
    return { ok: true as const, paid: true, token: link.publicToken, linkId: link.id };
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
