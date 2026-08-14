import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getAdminSessionUser } from "@/lib/admin/auth";
import { getContent } from "@/lib/cms/store";
import { buildReservationVoucherHtml } from "@/lib/booking/voucher";
import { splitVatInclusive, DEFAULT_VAT_RATE, DEFAULT_CURRENCY } from "@/lib/booking/vat";
import { BRAND_LOGO_PATH } from "@/lib/brand";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
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

  const content = await getContent();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://hotelthamelpark.com";

  const inclusive =
    Number(booking.grandTotal) > 0
      ? Number(booking.grandTotal)
      : Number(booking.displayPrice) > 0
        ? Number(booking.displayPrice)
        : Number(booking.totalAmount) || 0;

  const vat =
    Number(booking.basePrice) > 0 && Number(booking.vatAmount) >= 0 && Number(booking.grandTotal) > 0
      ? {
          displayPrice: Number(booking.displayPrice) || inclusive,
          basePrice: Number(booking.basePrice),
          vatRate: Number(booking.vatRate) || DEFAULT_VAT_RATE,
          vatAmount: Number(booking.vatAmount),
          grandTotal: Number(booking.grandTotal) || inclusive,
          currency: booking.currency || DEFAULT_CURRENCY,
        }
      : splitVatInclusive(inclusive, DEFAULT_VAT_RATE, booking.currency || DEFAULT_CURRENCY);

  const html = await buildReservationVoucherHtml({
    bookingId: booking.id,
    hotelName: content.hotel?.name || "Hotel Thamel Park",
    hotelEmail:
      content.settings?.bookingEmail ||
      content.hotel?.email ||
      "reservations@hotelthamelpark.com",
    hotelPhone: content.hotel?.phone || "",
    hotelAddress: content.hotel?.location || "Thamel, Kathmandu, Nepal",
    logoUrl: `${siteUrl.replace(/\/$/, "")}${content.header?.logoSrc || BRAND_LOGO_PATH}`,
    guestName: booking.name,
    guestEmail: booking.email,
    guestPhone: booking.phone,
    guestCountry: booking.country,
    roomName: booking.roomName,
    checkIn: booking.checkIn.toISOString().slice(0, 10),
    checkOut: booking.checkOut.toISOString().slice(0, 10),
    nights: booking.nights,
    adults: booking.guests,
    children: booking.children,
    roomQuantity: booking.roomQuantity,
    roomSubtotal: vat.displayPrice,
    extraGuestCharge: 0,
    vat,
    paymentMethod: booking.paymentMethod,
    paymentStatus: booking.paymentStatus,
    bookingStatus: booking.status,
    specialRequests: booking.specialRequests,
    verifyUrl: `${siteUrl.replace(/\/$/, "")}/api/bookings/${booking.id}/voucher?email=${encodeURIComponent(booking.email)}`,
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": `inline; filename="reservation-${booking.id}.html"`,
    },
  });
}
