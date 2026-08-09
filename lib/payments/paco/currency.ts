/**
 * Authoritative PACO settlement currencies for Hotel Thamel Park.
 * NPR support is intentional; USD must never silently fall back to NPR.
 */
export const PACO_SUPPORTED_CURRENCIES = ["USD", "NPR"] as const;
export type PacoSupportedCurrency = (typeof PACO_SUPPORTED_CURRENCIES)[number];

export function normalizePacoCurrency(raw: string | null | undefined): PacoSupportedCurrency {
  const c = String(raw || "").trim().toUpperCase();
  if (c === "USD" || c === "NPR") return c;
  throw new Error(`Unsupported PACO currency "${raw || ""}". Allowed: USD, NPR.`);
}

/** Convert major units → 12-digit amountText (HBL PHP: str_pad(amt*100, 12, '0', STR_PAD_LEFT)). */
export function toPacoMinorUnits(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`Invalid PACO amount: ${amount}`);
  }
  // Avoid float drift: round via string cents path for 2-decimal currencies.
  const cents = Math.round(Number((amount + Number.EPSILON).toFixed(2)) * 100);
  if (cents <= 0) {
    throw new Error(`PACO amount must be > 0 (got ${amount})`);
  }
  return cents;
}

export function formatPacoAmountFields(amount: number, currencyCode: string) {
  const currency = normalizePacoCurrency(currencyCode);
  const minor = toPacoMinorUnits(amount);
  const major = minor / 100;
  return {
    amountText: String(minor).padStart(12, "0"),
    currencyCode: currency,
    decimalPlaces: 2,
    amount: major,
  };
}

export function assertSameMoney(
  a: { amount: number; currencyCode: string; amountText: string },
  b: { amount: number; currencyCode: string; amountText: string },
  label: string
) {
  if (a.currencyCode !== b.currencyCode) {
    throw new Error(`${label}: currency mismatch ${a.currencyCode} vs ${b.currencyCode}`);
  }
  if (a.amountText !== b.amountText || a.amount !== b.amount) {
    throw new Error(
      `${label}: amount mismatch ${a.amountText}/${a.amount} vs ${b.amountText}/${b.amount}`
    );
  }
}

/** Walk nested callback/inquiry objects for an order number (key-based only). */
export function deepFindOrderNo(value: unknown, depth = 0): string | null {
  if (depth > 8 || value == null) return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = deepFindOrderNo(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof value !== "object") return null;

  const obj = value as Record<string, unknown>;
  const preferredKeys = [
    "orderNo",
    "OrderNo",
    "order_no",
    "orderId",
    "OrderId",
    "order_id",
  ];
  for (const key of preferredKeys) {
    const v = obj[key];
    if (typeof v === "string" || typeof v === "number") {
      const s = String(v).trim();
      // Reject amountText-style zero-padded strings (12 digits starting with many zeros).
      if (s && !/^0{4,}\d+$/.test(s)) return s;
    }
  }
  for (const v of Object.values(obj)) {
    if (v && typeof v === "object") {
      const found = deepFindOrderNo(v, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

export function sanitizePaymentRequestForLog(request: {
  orderNo?: string | number;
  officeId?: string;
  productDescription?: string;
  request3dsFlag?: string;
  mcpFlag?: string;
  transactionAmount?: { amount?: number; currencyCode?: string; amountText?: string; decimalPlaces?: number };
  purchaseItems?: Array<{ purchaseItemPrice?: { amount?: number; currencyCode?: string; amountText?: string } }>;
}) {
  const item = request.purchaseItems?.[0]?.purchaseItemPrice;
  return {
    orderNo: request.orderNo != null ? String(request.orderNo) : undefined,
    officeId: request.officeId,
    productDescription: request.productDescription,
    request3dsFlag: request.request3dsFlag,
    mcpFlag: request.mcpFlag,
    amount: request.transactionAmount?.amount,
    currency: request.transactionAmount?.currencyCode,
    transactionAmount: request.transactionAmount
      ? {
          amount: request.transactionAmount.amount,
          currencyCode: request.transactionAmount.currencyCode,
          amountText: request.transactionAmount.amountText,
          decimalPlaces: request.transactionAmount.decimalPlaces,
        }
      : undefined,
    purchaseItemPrice: item
      ? {
          amount: item.amount,
          currencyCode: item.currencyCode,
          amountText: item.amountText,
        }
      : undefined,
  };
}
