import { isPaymentLogoCleared } from "@/lib/cms/payment-logos";

/** Explicit Orbit clear/delete — never merge back to a default stock image. */
export const CMS_MEDIA_CLEARED = "__cleared__";

export function isCmsMediaCleared(src: string | undefined | null): boolean {
  const value = (src || "").trim();
  return !value || value === CMS_MEDIA_CLEARED || isPaymentLogoCleared(value);
}

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
  if (isCmsMediaCleared(src)) return "";
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
  if (isCmsMediaCleared(src)) return false;
  return true;
}

/**
 * Merge helper: undefined → fallback; "" / __cleared__ → permanently blank.
 */
export function mergeMediaSrc(value: string | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  if (isCmsMediaCleared(value)) return "";
  return value.trim();
}

/** Persist cleared slots as empty string in the database. */
export function persistMediaSrc(value: string | undefined | null): string {
  if (isCmsMediaCleared(value)) return "";
  return (value || "").trim();
}
