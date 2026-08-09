import {
  DEFAULT_CURRENCY,
  DEFAULT_VAT_RATE,
  splitVatInclusive,
} from "./vat";

/**
 * Persistable tax columns derived from a VAT-inclusive grand total.
 * Currency is server-authoritative (default USD). Callers may pass NPR when
 * an intentional NPR booking path is used — never invent NPR from client input.
 */
export function taxFieldsFromInclusiveTotal(
  inclusiveTotal: number,
  currency: string = DEFAULT_CURRENCY
) {
  const settled =
    String(currency || DEFAULT_CURRENCY).toUpperCase() === "NPR" ? "NPR" : "USD";
  const vat = splitVatInclusive(inclusiveTotal, DEFAULT_VAT_RATE, settled);
  return {
    displayPrice: vat.displayPrice,
    basePrice: vat.basePrice,
    vatRate: vat.vatRate,
    vatAmount: vat.vatAmount,
    grandTotal: vat.grandTotal,
    currency: vat.currency,
    /** Legacy Int column — whole dollars/units, still VAT-inclusive. */
    totalAmount: Math.round(vat.grandTotal),
  };
}
