/** Client-safe Cloudinary URL helpers (no server SDK import). */

export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com/");
}

export function publicIdFromCloudinaryUrl(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    const afterUpload = parts.slice(uploadIndex + 1);
    const withoutVersion =
      afterUpload[0]?.startsWith("v") && /^\d+$/.test(afterUpload[0].slice(1))
        ? afterUpload.slice(1)
        : afterUpload;
    const joined = withoutVersion.join("/");
    const lastDot = joined.lastIndexOf(".");
    return lastDot === -1 ? joined : joined.slice(0, lastDot);
  } catch {
    return null;
  }
}
