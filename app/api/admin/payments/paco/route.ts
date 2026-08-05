import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getAdminSessionUser } from "@/lib/admin/auth";
import {
  inquireTransaction,
  isPacoConfigured,
  pacoLog,
  refundTransaction,
  settleTransaction,
  syncPaymentFromInquiry,
  voidTransaction,
} from "@/lib/payments/paco";

export const dynamic = "force-dynamic";

type Action = "inquiry" | "refund" | "void" | "settle" | "sync";

export async function GET() {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const rows = await db.paymentTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      booking: {
        select: {
          id: true,
          name: true,
          email: true,
          roomName: true,
          paymentStatus: true,
          status: true,
          grandTotal: true,
          currency: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    configured: isPacoConfigured(),
    transactions: rows,
  });
}

export async function POST(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isPacoConfigured()) {
    return NextResponse.json({ success: false, error: "HBL PACO is not configured" }, { status: 503 });
  }

  const body = (await req.json()) as {
    action?: Action;
    orderNo?: string;
    bookingId?: number;
    amount?: number;
  };

  const action = body.action;
  if (!action) {
    return NextResponse.json({ success: false, error: "action is required" }, { status: 400 });
  }

  let txn = body.orderNo
    ? await db.paymentTransaction.findUnique({ where: { orderNo: body.orderNo } })
    : null;
  if (!txn && body.bookingId) {
    txn = await db.paymentTransaction.findFirst({
      where: { bookingId: body.bookingId },
      orderBy: { createdAt: "desc" },
    });
  }
  if (!txn) {
    return NextResponse.json({ success: false, error: "Payment transaction not found" }, { status: 404 });
  }

  const booking = await db.booking.findUnique({ where: { id: txn.bookingId } });
  if (!booking) {
    return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
  }

  const amount = Number(body.amount ?? txn.amount ?? booking.grandTotal);
  const currency = txn.currency || booking.currency || "USD";

  try {
    if (action === "inquiry" || action === "sync") {
      const result = await syncPaymentFromInquiry(txn.orderNo, "admin");
      const inquiry = await inquireTransaction(txn.orderNo);
      return NextResponse.json({ success: true, result, inquiry });
    }

    if (action === "refund") {
      const raw = await refundTransaction({
        orderNo: txn.orderNo,
        amount,
        currency,
        actionBy: `Admin|${user.username || user.id}`,
        actionEmail: process.env.BOOKING_NOTIFY_EMAIL || "booking@hotelthamelpark.com",
      });
      await db.paymentTransaction.update({
        where: { id: txn.id },
        data: { status: "refunded", rawResponse: raw as object },
      });
      await db.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: "refunded", status: "refunded" },
      });
      pacoLog("info", "admin_refund", { orderNo: txn.orderNo, bookingId: booking.id });
      return NextResponse.json({ success: true, raw });
    }

    if (action === "void") {
      const approval = txn.approvalCode || booking.issuerApprovalCode;
      if (!approval) {
        return NextResponse.json(
          { success: false, error: "issuerApprovalCode required for void — run inquiry first" },
          { status: 400 }
        );
      }
      const raw = await voidTransaction({
        orderNo: txn.orderNo,
        amount,
        currency,
        issuerApprovalCode: approval,
        productDescription: `Void booking ${booking.id}`,
      });
      await db.paymentTransaction.update({
        where: { id: txn.id },
        data: { status: "voided", rawResponse: raw as object },
      });
      await db.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: "void", status: "cancelled" },
      });
      pacoLog("info", "admin_void", { orderNo: txn.orderNo, bookingId: booking.id });
      return NextResponse.json({ success: true, raw });
    }

    if (action === "settle") {
      const approval = txn.approvalCode || booking.issuerApprovalCode;
      if (!approval) {
        return NextResponse.json(
          { success: false, error: "issuerApprovalCode required for settlement — run inquiry first" },
          { status: 400 }
        );
      }
      const raw = await settleTransaction({
        orderNo: txn.orderNo,
        amount,
        currency,
        issuerApprovalCode: approval,
        productDescription: `Settlement booking ${booking.id}`,
      });
      await db.paymentTransaction.update({
        where: { id: txn.id },
        data: { status: "settled", rawResponse: raw as object },
      });
      pacoLog("info", "admin_settle", { orderNo: txn.orderNo, bookingId: booking.id });
      return NextResponse.json({ success: true, raw });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    pacoLog("error", "admin_action_failed", {
      action,
      orderNo: txn.orderNo,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Action failed" },
      { status: 502 }
    );
  }
}
