/**
 * Normalize CMS media URLs and bust browser/CDN cache when src changes.
 * Empty / whitespace → empty string (callers should render a placeholder).
 * Bust token defaults to the path itself so replace/delete always remounts clients.
 */
export function mediaUrl(src: string | undefined | null, bust?: string | number): string {
  if (!src || !String(src).trim()) return "";
  const clean = String(src).trim();
  const token = bust === undefined || bust === null || bust === "" ? clean : String(bust);
  // Avoid stacking identical v= params on already-versioned URLs
  if (/[?&]v=/.test(clean)) return clean;
  const sep = clean.includes("?") ? "&" : "?";
  return `${clean}${sep}v=${encodeURIComponent(token)}`;
}

/** True when a CMS image field should render an <img>. */
export function hasMediaSrc(src: string | undefined | null): boolean {
  return Boolean(src && String(src).trim());
}
