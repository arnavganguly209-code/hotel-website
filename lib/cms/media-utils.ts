/** Client-safe local upload URL helpers (no Node fs). */

export function isLocalUploadUrl(url: string): boolean {
  if (!url) return false;
  try {
    if (/^https?:\/\//i.test(url)) {
      return new URL(url).pathname.includes("/uploads/");
    }
  } catch {
    return false;
  }
  return url.includes("/uploads/") || url.startsWith("uploads/");
}

/** Extract CMS public_id (uploads/...), or null for non-local assets. */
export function publicIdFromUploadUrl(url: string): string | null {
  if (!isLocalUploadUrl(url)) return null;
  try {
    let pathname = url;
    if (/^https?:\/\//i.test(url)) {
      pathname = new URL(url).pathname;
    }
    const marker = "/uploads/";
    const idx = pathname.indexOf(marker);
    const relative =
      idx === -1
        ? pathname.replace(/^\/+/, "")
        : pathname.slice(idx + 1); // uploads/...
    if (!relative.startsWith("uploads/") || relative.includes("..")) return null;
    return relative;
  } catch {
    return null;
  }
}
