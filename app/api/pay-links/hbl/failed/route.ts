import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pacoLog } from "@/lib/payments/paco";
import { readPayLinkOrderCookie, syncPayLinkFromInquiry } from "@/lib/pay-links/paco";
import { sendPayLinkFailedEmail } from "@/lib/pay-links/emails";

export const dynamic = "force-dynamic";

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://hotelthamelpark.com").replace(
    /\/$/,
    ""
  );
}

async function handle(req: Request, kind: "failed" | "cancel") {
  const url = new URL(req.url);
  const orderNo =
    url.searchParams.get("orderNo") || url.searchParams.get("order_no") || (await readPayLinkOrderCookie());
  pacoLog("info", `paylink_${kind}_redirect`, { orderNo: orderNo || undefined });
  let token = "";
  if (orderNo) {
    try {
      const result = await syncPayLinkFromInquiry(orderNo, kind);
      token = result.token || "";
      if (kind === "failed" && result.ok && "failed" in result && result.failed && "linkId" in result && result.linkId) {
        await sendPayLinkFailedEmail(result.linkId);
      }
    } catch (err) {
      pacoLog("error", `paylink_${kind}_sync_failed`, {
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
    ? `${siteBase()}/pay/${encodeURIComponent(token)}/failed`
    : `${siteBase()}/pay/unavailable`;
  return NextResponse.redirect(dest);
}

export async function GET(req: Request) {
  return handle(req, "failed");
}
export async function POST(req: Request) {
  return handle(req, "failed");
}
