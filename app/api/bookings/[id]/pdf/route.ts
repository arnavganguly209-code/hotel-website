import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getAdminSessionUser } from "@/lib/admin/auth";
import { formatBookingNumber } from "@/lib/booking/booking-number";
import { bookingToEmailContext } from "@/lib/email/booking-context";
import { buildReservationPdf } from "@/lib/email/pdf-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/**
 * Public (guest) booking PDF download.
 * Auth: matching ?email= guest address OR admin session.
 * Forces attachment download: Booking-{id}.pdf
 */
export async function GET(req: Request, { params }: Params) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
    }

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ success: false, error: "Invalid booking id" }, { status: 400 });
    }

    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const emailParam = (url.searchParams.get("email") || "").trim().toLowerCase();
    const admin = await getAdminSessionUser();
    const emailOk = Boolean(emailParam && emailParam === booking.email.trim().toLowerCase());
    if (!admin && !emailOk) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const ctx = bookingToEmailContext(booking, {
      issueDate: new Date().toISOString().slice(0, 10),
    });
    const pdf = await buildReservationPdf(ctx);
    const filename = `Booking-${formatBookingNumber(booking.id)}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Content-Length": String(pdf.length),
      },
    });
  } catch (err) {
    console.error(
      "[bookings/pdf] Failed:",
      err instanceof Error ? err.stack || err.message : err
    );
    return NextResponse.json({ success: false, error: "Unable to generate PDF" }, { status: 500 });
  }
}
