import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pacoLog } from "@/lib/payments/paco";
import { extractOrderNoFromRecord } from "@/lib/payments/paco/order-resolve";
import { readPayLinkOrderCookie, syncPayLinkFromInquiry } from "@/lib/pay-links/paco";
import { sendPayLinkPaidEmail } from "@/lib/pay-links/emails";

export const dynamic = "force-dynamic";

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://hotelthamelpark.com").replace(
    /\/$/,
    ""
  );
}

async function orderFromReq(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const q = url.searchParams.get("orderNo") || url.searchParams.get("order_no");
  if (q) return q;
  if (req.method === "POST") {
    try {
      const payload = (await req.clone().json()) as Record<string, unknown>;
      return extractOrderNoFromRecord(payload);
    } catch {
      return readPayLinkOrderCookie();
    }
  }
  return readPayLinkOrderCookie();
}

async function handle(req: Request) {
  const orderNo = await orderFromReq(req);
  pacoLog("info", "paylink_success_redirect", { orderNo: orderNo || undefined });
  let token = "";
  if (orderNo) {
    try {
      const result = await syncPayLinkFromInquiry(orderNo, "success");
      token = result.token || "";
      if (result.ok && "paid" in result && result.paid && "linkId" in result && result.linkId) {
        await sendPayLinkPaidEmail(result.linkId);
      }
    } catch (err) {
      pacoLog("error", "paylink_success_sync_failed", {
        orderNo,
        error: err instanceof Error ? err.message : String(err),
      });
    }
    if (!token) {
      const attempt = await db.paymentLinkAttempt.findUnique({
        where: { orderNo },
        include: { paymentLink: true },
      });
      token = attempt?.paymentLink.publicToken || "";
    }
  }
  const dest = token
    ? `${siteBase()}/pay/${encodeURIComponent(token)}/success`
    : `${siteBase()}/pay/unavailable`;
  return NextResponse.redirect(dest);
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
