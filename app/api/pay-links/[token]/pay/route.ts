import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { initiatePayLinkPayment, payLinkOrderCookie } from "@/lib/pay-links/paco";
import { isPayLinkToken } from "@/lib/pay-links/token";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ token: string }> };

export async function POST(req: Request, { params }: Params) {
  const { token } = await params;
  if (!isPayLinkToken(token)) {
    return NextResponse.json({ success: false, error: "Invalid payment link." }, { status: 400 });
  }
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
  try {
    const result = await initiatePayLinkPayment({
      token,
      ip,
      userAgent: req.headers.get("user-agent") || "",
    });
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status || 400 });
    }
    const jar = await cookies();
    const cookie = payLinkOrderCookie(result.orderNo);
    jar.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
      path: cookie.path,
      maxAge: cookie.maxAge,
      secure: cookie.secure,
    });
    return NextResponse.json({ success: true, redirectUrl: result.paymentPageURL });
  } catch (err) {
    console.error("[PayLinkPay]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: "Unable to start payment. Please try again." },
      { status: 500 }
    );
  }
}
