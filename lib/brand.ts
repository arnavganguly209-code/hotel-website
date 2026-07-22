/** Canonical Hotel Thamel Park brand mark — bump ICON_VERSION to bust caches. */
export const ICON_VERSION = "brand-20260722";

export const BRAND_LOGO_PATH = "/brand/thamelpark-logo.png";
export const BRAND_OG_IMAGE_PATH = "/brand/og-image.png";
export const BRAND_OG_LOGO_PATH = "/brand/og-logo.png";
export const BRAND_FAVICON_PATH = "/favicon.ico";
export const BRAND_APPLE_TOUCH_PATH = "/apple-touch-icon.png";

export function brandAsset(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${clean}?v=${ICON_VERSION}`;
}
