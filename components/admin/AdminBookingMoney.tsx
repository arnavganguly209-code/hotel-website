import { formatUsd, formatVatPercent } from "@/lib/booking/vat";

/** Fields commonly returned with Booking rows for VAT-inclusive pricing. */
export type BookingMoneyFields = {
  totalAmount?: number | null;
  displayPrice?: number | null;
  basePrice?: number | null;
  vatRate?: number | null;
  vatAmount?: number | null;
  grandTotal?: number | null;
  currency?: string | null;
};

export function bookingPayableAmount(b: BookingMoneyFields): number {
  const grand = Number(b.grandTotal);
  if (Number.isFinite(grand) && grand > 0) return grand;
  const display = Number(b.displayPrice);
  if (Number.isFinite(display) && display > 0) return display;
  return Number(b.totalAmount) || 0;
}

/** Compact multi-line VAT breakdown for admin tables. */
export function AdminBookingMoney({
  booking,
  tone = "light",
}: {
  booking: BookingMoneyFields;
  tone?: "light" | "dark";
}) {
  const payable = bookingPayableAmount(booking);
  const base = Number(booking.basePrice);
  const vat = Number(booking.vatAmount);
  const rate = Number(booking.vatRate) || 0.13;
  const currency = booking.currency || "USD";
  const hasSplit = Number.isFinite(base) && base > 0 && Number.isFinite(vat) && vat >= 0;
  const title = tone === "dark" ? "text-white" : "text-[#0f2420]";
  const muted = tone === "dark" ? "text-white/45" : "text-[#7a8a82]";
  const note = tone === "dark" ? "text-white/55" : "text-[#5a635c]";

  return (
    <div className="text-left">
      <p className={`font-serif text-lg ${title}`}>
        {formatUsd(payable)} {currency}
      </p>
      {hasSplit ? (
        <p className={`mt-0.5 text-[10px] leading-snug ${muted}`}>
          Excl. VAT {formatUsd(base)} · VAT ({formatVatPercent(rate)}) {formatUsd(vat)}
          <br />
          <span className={note}>VAT inclusive — guest pays this amount</span>
        </p>
      ) : (
        <p className={`mt-0.5 text-[10px] ${muted}`}>VAT inclusive</p>
      )}
    </div>
  );
}
