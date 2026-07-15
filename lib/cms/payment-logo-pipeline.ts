import { access, constants } from "node:fs/promises";
import path from "node:path";
import {
  isBundledPaymentUrl,
  isPaymentLogoCleared,
  isUploadsPaymentUrl,
  OFFICIAL_PAYMENT_LOGOS,
  PAYMENT_LOGO_CLEARED,
  stripUrlQuery,
} from "@/lib/cms/payment-logos";
import { resolveLocalUploadPath } from "@/lib/uploads";

export type PaymentLogoSlot = { id: string; src: string };

export { isBundledPaymentUrl, isUploadsPaymentUrl, stripUrlQuery };

export async function fileExistsOnDisk(absolutePath: string): Promise<boolean> {
  try {
    await access(absolutePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/** Resolve a public site-relative path (e.g. /media/payments/01-visa.png) to disk. */
export function resolvePublicMediaPath(url: string): string | null {
  const clean = stripUrlQuery(url);
  if (!clean.startsWith("/media/")) return null;
  if (clean.includes("..")) return null;
  return path.resolve(process.cwd(), "public", clean.replace(/^\/+/, ""));
}

/**
 * Verify a payment logo URL is safe to persist.
 * Returns normalized src (query preserved for cache-bust) or an error message.
 */
export async function verifyPaymentLogoSrc(
  src: string | undefined | null
): Promise<{ ok: true; src: string } | { ok: false; error: string }> {
  if (src === undefined || src === null) {
    return { ok: true, src: "" };
  }
  const raw = String(src).trim();
  if (!raw) return { ok: true, src: "" };
  if (isPaymentLogoCleared(raw)) return { ok: true, src: PAYMENT_LOGO_CLEARED };

  if (isBundledPaymentUrl(raw)) {
    const abs = resolvePublicMediaPath(raw);
    if (!abs || !(await fileExistsOnDisk(abs))) {
      return {
        ok: false,
        error: `Bundled payment logo missing on disk: ${stripUrlQuery(raw)}`,
      };
    }
    return { ok: true, src: raw };
  }

  if (isUploadsPaymentUrl(raw)) {
    const abs = resolveLocalUploadPath(raw);
    if (!abs) {
      return {
        ok: false,
        error: `Invalid upload path (must be under /uploads): ${stripUrlQuery(raw)}`,
      };
    }
    if (!(await fileExistsOnDisk(abs))) {
      return {
        ok: false,
        error: `Uploaded image not found on filesystem: ${stripUrlQuery(raw)}. Upload may have failed or the file was deleted.`,
      };
    }
    return { ok: true, src: raw };
  }

  return {
    ok: false,
    error: `Unsupported payment logo URL (use Orbit upload or bundled /media/payments): ${raw}`,
  };
}

export async function verifyAllPaymentLogos(
  logos: PaymentLogoSlot[] | undefined
): Promise<
  | { ok: true; logos: PaymentLogoSlot[] }
  | { ok: false; error: string; details: string[] }
> {
  const base = Array.from({ length: 6 }, (_, i) => ({
    id: logos?.[i]?.id || OFFICIAL_PAYMENT_LOGOS[i].id,
    src: logos?.[i]?.src ?? "",
  }));

  const details: string[] = [];
  const next: PaymentLogoSlot[] = [];

  for (let i = 0; i < 6; i++) {
    const slot = base[i];
    const raw = (slot.src || "").trim();

    if (isPaymentLogoCleared(raw)) {
      next.push({ id: slot.id, src: PAYMENT_LOGO_CLEARED });
      continue;
    }

    if (!raw) {
      next.push({ id: slot.id, src: OFFICIAL_PAYMENT_LOGOS[i].src });
      continue;
    }

    const result = await verifyPaymentLogoSrc(raw);
    if (!result.ok) {
      details.push(`Payment Logo ${i + 1} (${OFFICIAL_PAYMENT_LOGOS[i].label}): ${result.error}`);
      continue;
    }
    next.push({ id: slot.id, src: result.src });
  }

  if (details.length) {
    return {
      ok: false,
      error: "Payment logo save blocked — one or more image paths are invalid or missing on disk.",
      details,
    };
  }

  return { ok: true, logos: next };
}
