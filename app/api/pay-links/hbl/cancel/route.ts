import { NextResponse } from "next/server";
import { pacoLog } from "@/lib/payments/paco";
import { readPayLinkOrderCookie, syncPayLinkFromInquiry } from "@/lib/pay-links/paco";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://hotelthamelpark.com").replace(
    /\/$/,
    ""
  );
}

async function handle(req: Request) {
  const url = new URL(req.url);
  const orderNo =
    url.searchParams.get("orderNo") || url.searchParams.get("order_no") || (await readPayLinkOrderCookie());
  pacoLog("info", "paylink_cancel_redirect", { orderNo: orderNo || undefined });
  let token = "";
  if (orderNo) {
    try {
      const result = await syncPayLinkFromInquiry(orderNo, "cancel");
      token = result.token || "";
    } catch {
      /* ignore */
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
    ? `${siteBase()}/pay/${encodeURIComponent(token)}/failed`
    : `${siteBase()}/pay/unavailable`;
  return NextResponse.redirect(dest);
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
