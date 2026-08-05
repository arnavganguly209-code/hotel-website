import { NextResponse } from "next/server";
import { pacoLog, syncPaymentFromInquiry } from "@/lib/payments/paco";
import { resolveOrderNo } from "@/lib/payments/paco/order-resolve";

export const dynamic = "force-dynamic";

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "").replace(/\/$/, "");
}

async function handle(req: Request) {
  const orderNo = await resolveOrderNo(req);
  pacoLog("info", "success_redirect", { orderNo: orderNo || undefined });

  if (orderNo) {
    try {
      await syncPaymentFromInquiry(orderNo, "success");
    } catch (err) {
      pacoLog("error", "success_sync_failed", {
        orderNo,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const dest = new URL("/booking/payment/success", siteBase() || "http://localhost:3002");
  if (orderNo) dest.searchParams.set("orderNo", orderNo);
  return NextResponse.redirect(dest.toString());
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
