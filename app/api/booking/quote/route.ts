import { NextResponse } from "next/server";
import { getContent } from "@/lib/cms/store";
import { quoteRoomStay } from "@/lib/booking/quote";
import {
  bookingDatesAreValid,
  calculateNights,
  roomFitsOccupancy,
  roomPublicSlug,
} from "@/lib/booking/utils";
import { assertBookingAvailability } from "@/lib/admin/availability";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const roomSlug = (url.searchParams.get("roomSlug") || "").trim();
  const checkIn = (url.searchParams.get("checkIn") || "").trim();
  const checkOut = (url.searchParams.get("checkOut") || "").trim();
  const adults = Math.max(1, Math.min(20, Number(url.searchParams.get("adults") || "2") || 2));
  const children = Math.max(0, Math.min(20, Number(url.searchParams.get("children") || "0") || 0));
  const roomQuantity = Math.max(1, Math.min(20, Number(url.searchParams.get("rooms") || "1") || 1));

  if (!roomSlug || !bookingDatesAreValid(checkIn, checkOut)) {
    return NextResponse.json({ success: false, error: "Valid room and dates required" }, { status: 400 });
  }

  const content = await getContent();
  const room = content.rooms.find(
    (candidate) => candidate.id === roomSlug || roomPublicSlug(candidate) === roomSlug
  );
  if (!room || room.available === false) {
    return NextResponse.json({ success: false, error: "This room is not available." }, { status: 400 });
  }
  if (!roomFitsOccupancy(room, adults, children, roomQuantity)) {
    return NextResponse.json(
      { success: false, error: "Guest count exceeds this room’s maximum occupancy." },
      { status: 400 }
    );
  }

  const slug = roomPublicSlug(room);
  const stock = await assertBookingAvailability({
    roomSlug: slug,
    checkIn,
    checkOut,
    roomQuantity,
  });
  const quote = await quoteRoomStay({
    room,
    checkIn,
    checkOut,
    adults,
    children,
    roomQuantity,
    roomSlug: slug,
  });

  return NextResponse.json(
    {
      success: true,
      available: stock.ok,
      error: stock.ok ? null : stock.error,
      nights: calculateNights(checkIn, checkOut),
      occupancy: quote.occupancy,
      occupancyLabel: quote.occupancyLabel,
      includedChildren: quote.includedChildren,
      extraChildren: quote.extraChildren,
      extraChildPrice: quote.extraChildPrice,
      extraGuestCharge: quote.total,
      roomSubtotal: quote.roomSubtotal,
      baseNightly: quote.baseNightly,
      grandTotal: quote.grandTotal,
      vat: quote.vat,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
