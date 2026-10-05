import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import { sendPayLinkInvite } from "@/lib/pay-links/emails";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 });
  }

  const body = (await req.json()) as { id?: string; email?: string };
  if (!body.id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  const link = await db.paymentLink.findUnique({ where: { id: body.id } });
  if (!link) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  const email = (body.email || link.customerEmail || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, error: "A valid customer email is required." }, { status: 400 });
  }
  if (email !== link.customerEmail) {
    await db.paymentLink.update({ where: { id: link.id }, data: { customerEmail: email } });
  }
  const result = await sendPayLinkInvite({ ...link, customerEmail: email });
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error || "Unable to send email" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
