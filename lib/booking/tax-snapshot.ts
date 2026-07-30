import {
  DEFAULT_CURRENCY,
  DEFAULT_VAT_RATE,
  splitVatInclusive,
} from "./vat";

/** Persistable tax columns derived from a VAT-inclusive grand total. */
export function taxFieldsFromInclusiveTotal(inclusiveTotal: number) {
  const vat = splitVatInclusive(inclusiveTotal, DEFAULT_VAT_RATE, DEFAULT_CURRENCY);
  return {
    displayPrice: vat.displayPrice,
    basePrice: vat.basePrice,
    vatRate: vat.vatRate,
    vatAmount: vat.vatAmount,
    grandTotal: vat.grandTotal,
    currency: vat.currency,
    /** Legacy Int column — whole dollars, still VAT-inclusive. */
    totalAmount: Math.round(vat.grandTotal),
  };
}
