/** Nepal VAT — website room prices are VAT-inclusive. Never add VAT on top. */
export const DEFAULT_VAT_RATE = 0.13;
export const DEFAULT_CURRENCY = "USD";

export type VatInclusiveBreakdown = {
  /** Final selling price shown to the guest (VAT included). */
  displayPrice: number;
  /** Portion excluding VAT. */
  basePrice: number;
  /** VAT rate as decimal (0.13 = 13%). */
  vatRate: number;
  /** VAT portion of the inclusive total. */
  vatAmount: number;
  /** Same as displayPrice — what the guest pays. */
  grandTotal: number;
  currency: string;
};

/** Round to 2 decimal places (currency). */
export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Split a VAT-inclusive total into base + VAT.
 * Base = Total / (1 + rate), VAT = Total − Base.
 * Guest always pays exactly `inclusiveTotal`.
 */
export function splitVatInclusive(
  inclusiveTotal: number,
  vatRate: number = DEFAULT_VAT_RATE,
  currency: string = DEFAULT_CURRENCY
): VatInclusiveBreakdown {
  const grandTotal = roundMoney(Math.max(0, inclusiveTotal));
  const rate = Number.isFinite(vatRate) && vatRate >= 0 ? vatRate : DEFAULT_VAT_RATE;
  const basePrice = roundMoney(grandTotal / (1 + rate));
  const vatAmount = roundMoney(grandTotal - basePrice);
  return {
    displayPrice: grandTotal,
    basePrice,
    vatRate: rate,
    vatAmount,
    grandTotal,
    currency: currency || DEFAULT_CURRENCY,
  };
}

export function formatUsd(amount: number): string {
  return `$${roundMoney(amount).toFixed(2)}`;
}

export function formatVatPercent(rate: number = DEFAULT_VAT_RATE): string {
  return `${roundMoney(rate * 100)}%`;
}
