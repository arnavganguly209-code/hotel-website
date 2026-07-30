import { formatUsd, formatVatPercent, type VatInclusiveBreakdown } from "@/lib/booking/vat";

type Props = {
  roomSubtotal: number;
  extraGuestCharge: number;
  vat: VatInclusiveBreakdown;
  className?: string;
  compact?: boolean;
};

/** Shared VAT-inclusive price summary (never adds VAT on top of website rates). */
export function VatInclusivePriceSummary({
  roomSubtotal,
  extraGuestCharge,
  vat,
  className = "",
  compact = false,
}: Props) {
  return (
    <dl className={className}>
      <div className="flex justify-between gap-3">
        <dt className={compact ? "text-white/55" : "text-[#68736d]"}>Room Rate (VAT Included)</dt>
        <dd>{formatUsd(roomSubtotal)}</dd>
      </div>
      {extraGuestCharge > 0 ? (
        <div className="flex justify-between gap-3">
          <dt className={compact ? "text-white/55" : "text-[#68736d]"}>Extra Guest Charge</dt>
          <dd>{formatUsd(extraGuestCharge)}</dd>
        </div>
      ) : null}
      <div className={`mt-2 space-y-1.5 border-t pt-2 ${compact ? "border-white/15" : "border-[#d7c49d]/40"}`}>
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
            compact ? "text-[#e2c88f]/80" : "text-[#a47e3e]"
          }`}
        >
          Tax Breakdown
        </p>
        <div className="flex justify-between gap-3">
          <dt className={compact ? "text-white/55" : "text-[#68736d]"}>Room Charge (Excl. VAT)</dt>
          <dd>{formatUsd(vat.basePrice)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className={compact ? "text-white/55" : "text-[#68736d]"}>
            VAT ({formatVatPercent(vat.vatRate)})
          </dt>
          <dd>{formatUsd(vat.vatAmount)}</dd>
        </div>
      </div>
      <div
        className={`flex justify-between gap-3 border-t pt-2 font-semibold ${
          compact ? "border-white/15 text-[#e8d5a0]" : "border-[#d7c49d]/40"
        }`}
      >
        <dt>Grand Total</dt>
        <dd>
          {formatUsd(vat.grandTotal)} {vat.currency}
        </dd>
      </div>
    </dl>
  );
}
