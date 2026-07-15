/** Cleared slots stay empty (placeholder). Never fall back to a bundled logo after delete. */
export const PAYMENT_LOGO_CLEARED = "__cleared__";

/** Bundled official payment logos (git-tracked under public/media/payments). */
export const OFFICIAL_PAYMENT_LOGOS = [
  { id: "pay1", src: "/media/payments/01-visa.png?v=official3", label: "Visa" },
  { id: "pay2", src: "/media/payments/02-mastercard.png?v=official3", label: "Mastercard" },
  { id: "pay3", src: "/media/payments/03-unionpay.png?v=official3", label: "UnionPay" },
  { id: "pay4", src: "/media/payments/04-alipay.png?v=official3", label: "Alipay" },
  { id: "pay5", src: "/media/payments/05-upi.png?v=official3", label: "UPI" },
  { id: "pay6", src: "/media/payments/06-esewa.png?v=official3", label: "eSewa" },
] as const;

export function isPaymentLogoCleared(src: string | undefined | null): boolean {
  return (src || "").trim() === PAYMENT_LOGO_CLEARED;
}

export function normalizePaymentLogoSrc(src: string | undefined | null): string {
  const value = (src || "").trim();
  if (!value || isPaymentLogoCleared(value)) return "";
  return value;
}
