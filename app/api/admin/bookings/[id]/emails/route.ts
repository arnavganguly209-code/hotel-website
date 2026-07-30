import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import { EMAIL_TEMPLATES, type EmailTemplateId } from "@/lib/email/config";
import { emailService } from "@/lib/email/email-service";
import { bookingToEmailContext } from "@/lib/email/booking-context";
import { sendBookingLifecycleEmail } from "@/lib/email/booking-notifications";
import { previewBookingEmailHtml } from "@/lib/email/template-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin(req: Request) {
  if (!isDatabaseAvailable()) {
    return { error: NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 }) };
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return { error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }
  if (req.method !== "GET" && !assertSameOrigin(req)) {
    return { error: NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 }) };
  }
  return { user };
}

/** Email history for a booking. */
export async function GET(req: Request, { params }: Params) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ success: false, error: "Invalid booking id" }, { status: 400 });
  }

  const url = new URL(req.url);
  const preview = url.searchParams.get("preview");
  if (preview) {
    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }
    const template = (preview as EmailTemplateId) || EMAIL_TEMPLATES.BOOKING_CONFIRMATION;
    const html = previewBookingEmailHtml(template, bookingToEmailContext(booking));
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const logs = await emailService.listForBooking(id);
  return NextResponse.json({ success: true, logs });
}

/** Send / resend confirmation email. */
export async function POST(req: Request, { params }: Params) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ success: false, error: "Invalid booking id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    action?: "send" | "resend";
    template?: EmailTemplateId;
    logId?: string;
  };

  if (body.action === "resend" && body.logId) {
    const result = await emailService.resend(body.logId);
    return NextResponse.json({ success: result.ok, ...result }, { status: result.ok ? 200 : 400 });
  }

  const template = body.template || EMAIL_TEMPLATES.BOOKING_CONFIRMATION;
  const result = await sendBookingLifecycleEmail(id, template);
  return NextResponse.json({ success: result.ok, ...result }, { status: result.ok ? 200 : 400 });
}
