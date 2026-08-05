import { NextResponse } from "next/server";
import { markPaymentTerminal, pacoLog } from "@/lib/payments/paco";
import { resolveOrderNo } from "@/lib/payments/paco/order-resolve";

export const dynamic = "force-dynamic";

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "").replace(/\/$/, "");
}

async function handle(req: Request) {
  const orderNo = await resolveOrderNo(req);
  pacoLog("info", "cancel_redirect", { orderNo: orderNo || undefined });
  if (orderNo) {
    try {
      await markPaymentTerminal(orderNo, "cancelled");
    } catch (err) {
      pacoLog("error", "cancel_mark_error", {
        orderNo,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  const dest = new URL("/booking/payment/cancelled", siteBase() || "http://localhost:3002");
  if (orderNo) dest.searchParams.set("orderNo", orderNo);
  return NextResponse.redirect(dest.toString());
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
