import { isPaymentLogoCleared } from "@/lib/cms/payment-logos";

/**
 * Normalize CMS media URLs and bust browser/CDN cache when src changes.
 * Empty / whitespace / cleared → empty string (callers should render a placeholder).
 */
export function mediaUrl(src: string | undefined | null, bust?: string | number): string {
  if (!src || !String(src).trim() || isPaymentLogoCleared(src)) return "";
  const clean = String(src).trim();
  // Bundled logos already carry ?v=official…
  if (/[?&]v=/.test(clean)) return clean;
  const token = bust === undefined || bust === null || bust === "" ? clean : String(bust);
  const sep = clean.includes("?") ? "&" : "?";
  return `${clean}${sep}v=${encodeURIComponent(token)}`;
}

/** True when a CMS image field should render an <img>. */
export function hasMediaSrc(src: string | undefined | null): boolean {
  if (!src || !String(src).trim() || isPaymentLogoCleared(src)) return false;
  return true;
}
