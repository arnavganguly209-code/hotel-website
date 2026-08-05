import { cookies } from "next/headers";

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
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return null;
}

export async function resolveOrderNo(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const fromQuery =
    url.searchParams.get("orderNo") ||
    url.searchParams.get("order_no") ||
    url.searchParams.get("orderId");
  if (fromQuery?.trim()) return fromQuery.trim();

  if (req.method !== "GET" && req.method !== "HEAD") {
    const contentType = req.headers.get("content-type") || "";
    try {
      if (contentType.includes("application/json")) {
        const json = (await req.json()) as Record<string, unknown>;
        const found = extractOrderNoFromRecord(json);
        if (found) return found;
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
      }
    } catch {
      // ignore parse errors
    }
  }

  return readPacoOrderCookie();
}
