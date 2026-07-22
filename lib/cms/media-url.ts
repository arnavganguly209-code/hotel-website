import { isPaymentLogoCleared } from "@/lib/cms/payment-logos";

/**
 * Strip query/hash so callers can compare or re-bust media paths safely.
 */
export function stripMediaQuery(src: string | undefined | null): string {
  if (!src || !String(src).trim()) return "";
  return String(src).trim().split("#")[0].split("?")[0];
}

/**
 * Normalize CMS media URLs and bust browser/CDN/SW cache when content changes.
 * Empty / whitespace / cleared → empty string (callers should render a placeholder).
 *
 * Prefer a publish revision (`bust`) so replaced Orbit assets never reuse a stale
 * cached response even when a path briefly overlaps.
 */
export function mediaUrl(src: string | undefined | null, bust?: string | number): string {
  if (!src || !String(src).trim() || isPaymentLogoCleared(src)) return "";
  const clean = stripMediaQuery(src);
  if (!clean) return "";

  const token =
    bust === undefined || bust === null || bust === ""
      ? clean
      : String(bust);

  // Always rewrite ?v= so an older upload timestamp cannot stick after publish.
  return `${clean}?v=${encodeURIComponent(token)}`;
}

/** True when a CMS image field should render an <img>. */
export function hasMediaSrc(src: string | undefined | null): boolean {
  if (!src || !String(src).trim() || isPaymentLogoCleared(src)) return false;
  return true;
}
