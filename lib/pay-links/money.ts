import { getPublicAppUrl } from "@/lib/email/config";

export const PAY_LINK_STATUSES = [
  "CREATED",
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
] as const;

export type PayLinkStatus = (typeof PAY_LINK_STATUSES)[number];

export function publicPayUrl(token: string): string {
  return `${getPublicAppUrl()}/pay/${encodeURIComponent(token)}`;
}

export function absoluteAssetUrl(pathOrUrl: string): string {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = getPublicAppUrl();
  return `${base}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

export function formatUsdAmount(amount: number): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

export function normalizeUsdAmount(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value.trim()) : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  const rounded = Math.round(n * 100) / 100;
  if (rounded < 0.5 || rounded > 50000) return null;
  return rounded;
}

export function isTerminalPaid(status: string): boolean {
  return status === "PAID";
}

export function canEditPayLink(status: string): boolean {
  return status === "CREATED" || status === "PENDING" || status === "FAILED";
}

export function canCollectPayment(status: string, expiresAt?: Date | null): boolean {
  if (status === "PAID" || status === "CANCELLED" || status === "EXPIRED") return false;
  if (expiresAt && expiresAt.getTime() <= Date.now()) return false;
  return true;
}
