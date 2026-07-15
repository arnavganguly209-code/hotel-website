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

/** Strip query/hash — safe for client + server. */
export function stripUrlQuery(url: string): string {
  return (url || "").trim().split("?")[0].split("#")[0];
}

/** True for git-bundled official payment art. */
export function isBundledPaymentUrl(url: string): boolean {
  return stripUrlQuery(url).startsWith("/media/payments/");
}

/** True for local Orbit upload paths under /uploads/… */
export function isUploadsPaymentUrl(url: string): boolean {
  const clean = stripUrlQuery(url);
  return clean.startsWith("/uploads/");
}
