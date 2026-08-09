import { cookies } from "next/headers";
import { deepFindOrderNo } from "./currency";
import { getPacoConfig, isPacoConfigured } from "./config";
import { decryptToken } from "./jose";
import { pacoLog } from "./logger";

const ORDER_COOKIE = "hbl_paco_order";

export function pacoOrderCookieOptions(orderNo: string) {
  return {
    name: ORDER_COOKIE,
    value: orderNo,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 6,
    secure: process.env.COOKIE_SECURE === "true" || (process.env.SITE_URL || "").startsWith("https"),
  };
}

export async function readPacoOrderCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ORDER_COOKIE)?.value || null;
}

export function extractOrderNoFromRecord(payload: Record<string, unknown>): string | null {
  const candidates = [
    payload.orderNo,
    payload.order_no,
    payload.OrderNo,
    payload.orderId,
    payload.order_id,
    (payload.request as Record<string, unknown> | undefined)?.orderNo,
    (payload.request as Record<string, unknown> | undefined)?.OrderNo,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
    if (typeof c === "number" && Number.isFinite(c)) return String(c);
  }
  return deepFindOrderNo(payload);
}

/** Try decrypt application/jose callback bodies used by PACO backend notifications. */
export async function tryDecryptCallbackBody(raw: string): Promise<Record<string, unknown> | null> {
  const token = raw.trim();
  if (!token || token.split(".").length < 3) return null;
  if (!isPacoConfigured()) return null;
  try {
    const config = getPacoConfig();
    const json = await decryptToken(token, config);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return parsed;
  } catch (err) {
    pacoLog("warn", "callback_jose_decrypt_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function resolveOrderNo(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const fromQuery =
    url.searchParams.get("orderNo") ||
    url.searchParams.get("order_no") ||
    url.searchParams.get("orderId") ||
    url.searchParams.get("OrderNo");
  if (fromQuery?.trim()) return fromQuery.trim();

  if (req.method !== "GET" && req.method !== "HEAD") {
    const contentType = req.headers.get("content-type") || "";
    try {
      if (contentType.includes("application/jose") || contentType.includes("application/jwt")) {
        const text = await req.text();
        const decrypted = await tryDecryptCallbackBody(text);
        if (decrypted) {
          const found = extractOrderNoFromRecord(decrypted);
          if (found) return found;
        }
      } else if (contentType.includes("application/json")) {
        const json = (await req.json()) as Record<string, unknown>;
        const found = extractOrderNoFromRecord(json);
        if (found) return found;
        // Some gateways wrap JOSE in JSON { paymentResponse: "..." }
        for (const key of ["paymentResponse", "response", "payload", "data", "token"]) {
          const v = json[key];
          if (typeof v === "string") {
            const decrypted = await tryDecryptCallbackBody(v);
            if (decrypted) {
              const nested = extractOrderNoFromRecord(decrypted);
              if (nested) return nested;
            }
          }
        }
      } else if (
        contentType.includes("application/x-www-form-urlencoded") ||
        contentType.includes("multipart/form-data")
      ) {
        const form = await req.formData();
        const out: Record<string, unknown> = {};
        form.forEach((value, key) => {
          out[key] = typeof value === "string" ? value : value.name;
        });
        const found = extractOrderNoFromRecord(out);
        if (found) return found;
        for (const key of ["paymentResponse", "response", "payload", "token"]) {
          const v = out[key];
          if (typeof v === "string") {
            const decrypted = await tryDecryptCallbackBody(v);
            if (decrypted) {
              const nested = extractOrderNoFromRecord(decrypted);
              if (nested) return nested;
            }
          }
        }
      } else {
        const text = await req.text();
        if (text) {
          try {
            const json = JSON.parse(text) as Record<string, unknown>;
            const found = extractOrderNoFromRecord(json);
            if (found) return found;
          } catch {
            const decrypted = await tryDecryptCallbackBody(text);
            if (decrypted) {
              const found = extractOrderNoFromRecord(decrypted);
              if (found) return found;
            }
          }
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  return readPacoOrderCookie();
}
