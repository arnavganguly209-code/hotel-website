import Link from "next/link";
import { db, isDatabaseAvailable } from "@/lib/db";
import { formatBookingNumber } from "@/lib/booking/booking-number";
import { syncPaymentFromInquiry } from "@/lib/payments/paco";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNo?: string }>;
}) {
  const { orderNo } = await searchParams;
  let booking: {
    id: number;
    name: string;
    email: string;
    paymentStatus: string;
    transactionId: string | null;
    grandTotal: number;
    currency: string;
  } | null = null;

  if (orderNo && isDatabaseAvailable()) {
    try {
      await syncPaymentFromInquiry(orderNo, "success");
    } catch {
      // page still renders
    }
    const txn = await db.paymentTransaction.findUnique({ where: { orderNo } });
    if (txn) {
      booking = await db.booking.findUnique({
        where: { id: txn.bookingId },
        select: {
          id: true,
          name: true,
          email: true,
          paymentStatus: true,
          transactionId: true,
          grandTotal: true,
          currency: true,
        },
      });
    }
  }

  const paid = booking?.paymentStatus === "paid";

  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <p className="text-[11px] uppercase tracking-[0.25em] text-[#a47e3e]">Payment</p>
      <h1 className="mt-3 font-display text-4xl text-[#173a2b]">
        {paid ? "Payment successful" : "Payment received — confirming"}
      </h1>
      <p className="mt-4 text-sm leading-7 text-[#657169]">
        {paid
          ? "Thank you. Your booking is confirmed and a confirmation email with your voucher is on the way."
          : "We are verifying your payment with Himalayan Bank. You will receive a confirmation email shortly."}
      </p>
      {booking ? (
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[#d7c49d]/40 bg-[#f8f4eb] px-5 py-4 text-left text-sm text-[#173a2b]">
          <p>
            <span className="text-[#7a8a82]">Booking</span> {formatBookingNumber(booking.id)}
          </p>
          <p className="mt-1">
            <span className="text-[#7a8a82]">Guest</span> {booking.name}
          </p>
          <p className="mt-1">
            <span className="text-[#7a8a82]">Amount</span> {booking.currency} {booking.grandTotal.toFixed(2)}
          </p>
          <p className="mt-1">
            <span className="text-[#7a8a82]">Transaction</span>{" "}
            {booking.transactionId || orderNo || "—"}
          </p>
          <p className="mt-1">
            <span className="text-[#7a8a82]">Status</span> {booking.paymentStatus}
          </p>
        </div>
      ) : null}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {booking ? (
          <a
            href={`/api/bookings/${booking.id}/pdf?email=${encodeURIComponent(booking.email)}&download=1`}
            className="inline-flex rounded-lg bg-[#c5a059] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Download voucher PDF
          </a>
        ) : null}
        <Link href="/" className="inline-flex rounded-lg border border-[#c5a059]/40 px-5 py-2.5 text-sm text-[#173a2b]">
          Back to home
        </Link>
      </div>
    </main>
  );
}
