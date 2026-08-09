import { NextResponse } from "next/server";
import { markPaymentTerminal, pacoLog, syncPaymentFromInquiry } from "@/lib/payments/paco";
import { resolveOrderNo } from "@/lib/payments/paco/order-resolve";

export const dynamic = "force-dynamic";

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "").replace(/\/$/, "");
}

async function handle(req: Request) {
  const orderNo = await resolveOrderNo(req);
  pacoLog("info", "failed_redirect", { orderNo: orderNo || undefined });

  if (orderNo) {
    try {
      // Prefer PACO inquiry over front-channel FailedUrl alone.
      const synced = await syncPaymentFromInquiry(orderNo, "failed");
      if (synced.ok && "paid" in synced && synced.paid) {
        // Rare: FailedUrl but inquiry says paid — trust inquiry; do not force-fail.
        pacoLog("warn", "failed_url_but_inquiry_paid", { orderNo });
      } else if (synced.ok && "failed" in synced && synced.failed) {
        // Already marked failed by inquiry sync.
      } else {
        // Inquiry pending/error/unknown — still record terminal failed from FailedUrl.
        await markPaymentTerminal(orderNo, "failed");
      }
    } catch (err) {
      pacoLog("error", "failed_mark_error", {
        orderNo,
        error: err instanceof Error ? err.message : String(err),
      });
      try {
        await markPaymentTerminal(orderNo, "failed");
      } catch {
        // ignore secondary failure
      }
    }
  }

  const dest = new URL("/booking/payment/failed", siteBase() || "http://localhost:3002");
  if (orderNo) dest.searchParams.set("orderNo", orderNo);
  return NextResponse.redirect(dest.toString());
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
