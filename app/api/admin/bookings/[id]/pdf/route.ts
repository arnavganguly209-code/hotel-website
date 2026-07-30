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
 * Server-generated reservation PDF.
 * ?format=download (default) → attachment
 * ?format=preview|print|inline → inline for browser preview / print
 */
export async function GET(req: Request, { params }: Params) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ success: false, error: "Invalid booking id" }, { status: 400 });
  }

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const format = (url.searchParams.get("format") || "download").toLowerCase();
  const ctx = bookingToEmailContext(booking, {
    issueDate: new Date().toISOString().slice(0, 10),
  });
  const pdf = await buildReservationPdf(ctx);
  const inline = ["preview", "print", "inline", "view"].includes(format);

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="Booking-${formatBookingNumber(booking.id)}.pdf"`,
    },
  });
}
