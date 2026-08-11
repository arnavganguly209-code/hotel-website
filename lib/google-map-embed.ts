/** Official Hotel Thamel Park Google Maps embed (place pin, not a generic Thamel view). */
export const HOTEL_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.9982317257204!2d85.30579297371897!3d27.71734087241958!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb18e32929697d%3A0x1901ac458c23db67!2sHotel%20Thamel%20Park%20Pvt.%20Ltd.!5e0!3m2!1sen!2snp!4v1786467122394!5m2!1sen!2snp";

/**
 * Orbit/CMS often stores a pasted <iframe> snippet. Using that string as iframe src
 * makes the browser load our own site inside the map box.
 */
export function normalizeGoogleMapEmbedUrl(
  raw: string | undefined | null,
  fallback = HOTEL_MAP_EMBED_URL
): string {
  if (!raw?.trim()) return fallback;

  let value = raw.trim();
  value = value
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, "&");

  const fromIframe = value.match(/src\s*=\s*["']([^"']+)["']/i)?.[1];
  if (fromIframe) value = fromIframe.trim();
  value = value.replace(/^["']|["']$/g, "").trim();

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, "");
    if (
      (host === "google.com" || host === "maps.google.com") &&
      parsed.pathname.includes("/maps/embed")
    ) {
      return parsed.toString();
    }
  } catch {
    /* fall through */
  }

  return fallback;
}
