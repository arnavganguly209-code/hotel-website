import { db, isDatabaseAvailable } from "@/lib/db";
import { formatBookingNumber } from "@/lib/booking/booking-number";
import { sendRoomBookingEmails } from "@/lib/mail";
import { inquireTransaction, parseInquiryOutcome } from "./client";
import { getPacoConfig } from "./config";
import { pacoLog } from "./logger";

/**
 * After callback / success redirect: inquire PACO, mark booking paid once, send emails.
 * Idempotent for duplicate callbacks.
 */
export async function syncPaymentFromInquiry(orderNo: string, source: "callback" | "success" | "admin" | "retry" | "failed") {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not configured");
  }

  const txn = await db.paymentTransaction.findUnique({ where: { orderNo } });
  if (!txn) {
    pacoLog("warn", "inquiry_unknown_order", { orderNo, source });
    return { ok: false as const, error: "Unknown order" };
  }

  const booking = await db.booking.findUnique({ where: { id: txn.bookingId } });
  if (!booking) {
    return { ok: false as const, error: "Booking not found" };
  }

  if (booking.paymentStatus === "paid" && booking.status === "confirmed") {
    pacoLog("info", "already_paid_idempotent", { orderNo, bookingId: booking.id, source });
    return { ok: true as const, alreadyPaid: true, bookingId: booking.id };
  }

  let inquiry: Record<string, unknown>;
  try {
    inquiry = await inquireTransaction(orderNo);
  } catch (err) {
    pacoLog("error", "inquiry_failed", {
      orderNo,
      source,
      error: err instanceof Error ? err.message : String(err),
    });
    await db.paymentTransaction.update({
      where: { id: txn.id },
      data: {
        status: "error",
        errorMessage: err instanceof Error ? err.message : "Inquiry failed",
        lastInquiryAt: new Date(),
      },
    });
    return { ok: false as const, error: "Inquiry failed" };
  }

  const outcome = parseInquiryOutcome(inquiry);
  pacoLog("info", "inquiry_parsed", {
    orderNo,
    source,
    paid: outcome.paid,
    failed: outcome.failed,
    statusText: outcome.statusText,
    inquiryAmount: outcome.amount,
    inquiryCurrency: outcome.currency,
    inquiryOfficeId: outcome.officeId,
    bookingAmount: txn.amount,
    bookingCurrency: txn.currency,
  });

  // Never mark paid if HBL amount/currency disagrees with our PaymentTransaction.
  if (outcome.paid) {
    const merchantId = getPacoConfig().officeId;
    if (outcome.officeId && outcome.officeId !== merchantId) {
      pacoLog("error", "inquiry_merchant_mismatch", {
        orderNo,
        source,
        expectedOfficeId: merchantId,
        inquiryOfficeId: outcome.officeId,
      });
      await db.paymentTransaction.update({
        where: { id: txn.id },
        data: {
          rawInquiry: inquiry as object,
          lastInquiryAt: new Date(),
          status: "error",
          errorMessage: "Merchant/MID mismatch vs PACO inquiry",
        },
      });
      return {
        ok: false as const,
        error: "Merchant/MID mismatch",
        bookingId: booking.id,
      };
    }
    const expectedCurrency = String(txn.currency || booking.currency || "").toUpperCase();
    const inquiryCurrency = String(outcome.currency || "").toUpperCase();
    const expectedAmount = Number(txn.amount);
    const inquiryAmount = outcome.amount;
    const currencyMismatch =
      inquiryCurrency && expectedCurrency && inquiryCurrency !== expectedCurrency;
    const amountMismatch =
      typeof inquiryAmount === "number" &&
      Number.isFinite(expectedAmount) &&
      Math.round(inquiryAmount * 100) !== Math.round(expectedAmount * 100);

    if (currencyMismatch || amountMismatch) {
      pacoLog("error", "inquiry_money_mismatch", {
        orderNo,
        source,
        expectedAmount,
        expectedCurrency,
        inquiryAmount,
        inquiryCurrency,
      });
      await db.paymentTransaction.update({
        where: { id: txn.id },
        data: {
          rawInquiry: inquiry as object,
          lastInquiryAt: new Date(),
          status: "error",
          errorMessage: `Amount/currency mismatch vs booking (expected ${expectedAmount} ${expectedCurrency}, got ${inquiryAmount} ${inquiryCurrency})`,
        },
      });
      await db.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: "failed",
          status: "payment_pending",
        },
      });
      return {
        ok: false as const,
        error: "Amount/currency mismatch",
        bookingId: booking.id,
      };
    }
  }

  await db.paymentTransaction.update({
    where: { id: txn.id },
    data: {
      rawInquiry: inquiry as object,
      lastInquiryAt: new Date(),
      approvalCode: outcome.approvalCode || txn.approvalCode,
      invoiceNo: outcome.invoiceNo || txn.invoiceNo,
      status: outcome.paid ? "paid" : outcome.failed ? "failed" : txn.status === "callback_received" ? "callback_received" : txn.status,
    },
  });

  if (outcome.failed) {
    await db.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: "failed",
        status: booking.status === "payment_pending" ? "payment_pending" : booking.status,
      },
    });
    return { ok: true as const, paid: false, failed: true, bookingId: booking.id };
  }

  if (!outcome.paid) {
    return { ok: true as const, paid: false, pending: true, bookingId: booking.id };
  }

  const paidAt = new Date();
  await db.booking.update({
    where: { id: booking.id },
    data: {
      status: "confirmed",
      paymentStatus: "paid",
      paymentMethod: "online",
      transactionId: outcome.invoiceNo || orderNo,
      paymentGateway: "hbl_paco",
      paymentDate: paidAt,
      issuerApprovalCode: outcome.approvalCode || null,
      pacoOrderNo: orderNo,
    },
  });

  await db.paymentTransaction.update({
    where: { id: txn.id },
    data: {
      status: "paid",
      paidAt,
      approvalCode: outcome.approvalCode || txn.approvalCode,
      invoiceNo: outcome.invoiceNo || txn.invoiceNo,
    },
  });

  // Send confirmation emails only once after first successful pay
  if (!txn.emailsSentAt) {
    try {
      await sendRoomBookingEmails(
        {
          id: booking.id,
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          country: booking.country,
          specialRequests: booking.specialRequests,
          roomName: booking.roomName,
          checkIn: booking.checkIn.toISOString().slice(0, 10),
          checkOut: booking.checkOut.toISOString().slice(0, 10),
          nights: booking.nights,
          adults: booking.guests,
          children: booking.children,
          roomQuantity: booking.roomQuantity,
          roomSubtotal: booking.basePrice,
          extraGuestCharge: 0,
          displayPrice: booking.displayPrice,
          basePrice: booking.basePrice,
          vatRate: booking.vatRate,
          vatAmount: booking.vatAmount,
          grandTotal: booking.grandTotal,
          currency: booking.currency,
          paymentMethod: "online",
          bookingStatus: "confirmed",
          paymentStatus: "paid",
          bookingDate: booking.createdAt.toISOString().slice(0, 10),
          bookingTime: booking.createdAt.toISOString(),
          voucherUrl: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ""}/api/bookings/${booking.id}/voucher?email=${encodeURIComponent(booking.email)}`,
        },
        "booking@hotelthamelpark.com"
      );
      await db.paymentTransaction.update({
        where: { id: txn.id },
        data: { emailsSentAt: new Date() },
      });
      pacoLog("info", "paid_emails_sent", { bookingId: booking.id, orderNo });
    } catch (err) {
      pacoLog("error", "paid_emails_failed", {
        bookingId: booking.id,
        orderNo,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  pacoLog("info", "booking_marked_paid", {
    bookingId: booking.id,
    bookingNumber: formatBookingNumber(booking.id),
    orderNo,
    source,
  });

  return { ok: true as const, paid: true, bookingId: booking.id };
}

export async function markPaymentTerminal(
  orderNo: string,
  terminal: "failed" | "cancelled"
) {
  if (!isDatabaseAvailable()) return;
  const txn = await db.paymentTransaction.findUnique({ where: { orderNo } });
  if (!txn) return;
  const booking = await db.booking.findUnique({ where: { id: txn.bookingId } });
  if (!booking) return;
  if (booking.paymentStatus === "paid") return;

  await db.paymentTransaction.update({
    where: { id: txn.id },
    data: { status: terminal },
  });
  await db.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: terminal,
      status: "payment_pending",
    },
  });
}
