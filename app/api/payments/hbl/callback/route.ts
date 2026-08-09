import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { pacoLog, syncPaymentFromInquiry } from "@/lib/payments/paco";
import {
  extractOrderNoFromRecord,
  tryDecryptCallbackBody,
} from "@/lib/payments/paco/order-resolve";

export const dynamic = "force-dynamic";

async function extractPayload(req: Request): Promise<Record<string, unknown>> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/jose") || contentType.includes("application/jwt")) {
    const text = await req.text();
    const decrypted = await tryDecryptCallbackBody(text);
    return decrypted || { rawJose: true, length: text.length };
  }
  if (contentType.includes("application/json")) {
    try {
      return (await req.json()) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await req.formData();
    const out: Record<string, unknown> = {};
    form.forEach((value, key) => {
      out[key] = typeof value === "string" ? value : value.name;
    });
    return out;
  }
  const text = await req.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const decrypted = await tryDecryptCallbackBody(text);
    return decrypted || { raw: text.slice(0, 200) };
  }
}

function pickOrderNo(payload: Record<string, unknown>, url: URL): string | null {
  const candidates = [
    url.searchParams.get("orderNo"),
    url.searchParams.get("order_no"),
    url.searchParams.get("orderId"),
    url.searchParams.get("OrderNo"),
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return extractOrderNoFromRecord(payload);
}

async function handleCallback(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const payload = req.method === "GET" ? {} : await extractPayload(req);
  let orderNo = pickOrderNo(payload, url);

  if (!orderNo) {
    const { readPacoOrderCookie } = await import("@/lib/payments/paco/order-resolve");
    orderNo = await readPacoOrderCookie();
  }

  pacoLog("info", "callback_received", {
    method: req.method,
    orderNo: orderNo || undefined,
    keys: Object.keys(payload),
  });

  if (!orderNo) {
    return NextResponse.json({ success: false, error: "Missing orderNo" }, { status: 400 });
  }

  const txn = await db.paymentTransaction.findUnique({ where: { orderNo } });
  if (txn) {
    await db.paymentTransaction.update({
      where: { id: txn.id },
      data: {
        status: "callback_received",
        rawCallback: payload as object,
      },
    });
  }

  const result = await syncPaymentFromInquiry(orderNo, "callback");
  return NextResponse.json({ success: result.ok, ...result });
}

export async function POST(req: Request) {
  try {
    return await handleCallback(req);
  } catch (err) {
    pacoLog("error", "callback_crash", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ success: false, error: "Callback failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    return await handleCallback(req);
  } catch (err) {
    pacoLog("error", "callback_crash", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ success: false, error: "Callback failed" }, { status: 500 });
  }
}
