import { stripMediaQuery } from "@/lib/cms/media-url";

const MEDIA_EXT = /\.(jpe?g|png|webp|gif|svg|avif|mp4|webm|mov)(\?|#|$)/i;

function looksLikeMediaUrl(value: string): boolean {
  const s = value.trim();
  if (!s) return false;
  if (s.startsWith("/uploads/") || s.startsWith("/media/")) return true;
  if (s.startsWith("http://") || s.startsWith("https://")) return MEDIA_EXT.test(s);
  return MEDIA_EXT.test(s);
}

/** Collect stable media paths from an arbitrary CMS payload. */
export function collectMediaPaths(node: unknown, out = new Set<string>()): Set<string> {
  if (node == null) return out;
  if (typeof node === "string") {
    if (looksLikeMediaUrl(node)) out.add(stripMediaQuery(node));
    return out;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectMediaPaths(item, out);
    return out;
  }
  if (typeof node === "object") {
    for (const value of Object.values(node as Record<string, unknown>)) {
      collectMediaPaths(value, out);
    }
  }
  return out;
}

/** Sorted fingerprint of all media paths — used to bump mediaRevision only when assets change. */
export function mediaFingerprint(content: unknown): string {
  return [...collectMediaPaths(content)].sort().join("|");
}
