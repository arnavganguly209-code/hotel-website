import { NextResponse } from "next/server";
import { isDatabaseAvailable, db } from "@/lib/db";
import { getContent } from "@/lib/cms/store";
import { assertBookingAvailability } from "@/lib/admin/availability";
import {
  bookingDatesAreValid,
  calculateBookingTotal,
  calculateNights,
  roomPublicSlug,
} from "@/lib/booking/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      name: string;
      email: string;
      phone?: string;
      whatsapp?: string;
      countryCode?: string;
      country?: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      children?: number;
      roomQuantity?: number;
      roomSlug: string;
      roomName: string;
      breakfast?: string;
      specialRequests?: string;
      paymentMethod?: string;
      totalAmount?: number;
      nights?: number;
      promoCode?: string;
      arrivalTime?: string;
      flightNumber?: string;
      notes?: string;
      cardLast4?: string;
    };

    if (
      !body.name?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email || "") ||
      !body.phone?.trim() ||
      !body.country?.trim() ||
      !body.roomSlug ||
      !bookingDatesAreValid(body.checkIn, body.checkOut)
    ) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const content = await getContent();
    const room = content.rooms.find(
      (candidate) =>
        candidate.id === body.roomSlug ||
        roomPublicSlug(candidate) === body.roomSlug
    );
    if (!room || room.available === false) {
      return NextResponse.json({ success: false, error: "This room is not available." }, { status: 400 });
    }
    if (body.paymentMethod !== "hotel" && body.paymentMethod !== "online") {
      return NextResponse.json({ success: false, error: "Select a valid payment method." }, { status: 400 });
    }
    if (body.paymentMethod === "online" && !/^\d{4}$/.test(body.cardLast4 || "")) {
      return NextResponse.json(
        { success: false, error: "Complete and validate the online card details." },
        { status: 400 }
      );
    }

    const guests = Math.max(1, Math.min(8, Number(body.guests) || 1));
    const children = Math.max(0, Math.min(6, Number(body.children) || 0));
    const roomQuantity = Math.max(1, Math.min(4, Number(body.roomQuantity) || 1));
    const maxGuests = room.maxGuests ?? 2;
    if (guests + children > maxGuests * roomQuantity) {
      return NextResponse.json({ success: false, error: "Guest count exceeds room capacity." }, { status: 400 });
    }
    const breakfast = body.breakfast === "room-only" ? "room-only" : "with-breakfast";
    const nights = calculateNights(body.checkIn, body.checkOut);

    const availability = await assertBookingAvailability({
      roomSlug: roomPublicSlug(room),
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      roomQuantity,
    });
    if (!availability.ok) {
      return NextResponse.json({ success: false, error: availability.error }, { status: 400 });
    }

    const totalAmount = calculateBookingTotal({
      room,
      nights,
      roomQuantity,
      breakfast,
    });

    const booking = await db.booking.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone ?? "",
        whatsapp: body.whatsapp ?? "",
        countryCode: body.countryCode ?? "",
        country: body.country ?? "",
        checkIn: new Date(body.checkIn),
        checkOut: new Date(body.checkOut),
        guests,
        children,
        roomQuantity,
        roomSlug: roomPublicSlug(room),
        roomName: room.name,
        breakfast,
        specialRequests: body.specialRequests ?? "",
        promoCode: body.promoCode ?? "",
        arrivalTime: body.arrivalTime ?? "",
        flightNumber: body.flightNumber ?? "",
        notes: body.notes ?? "",
        paymentMethod: body.paymentMethod,
        cardLast4: /^\d{4}$/.test(body.cardLast4 || "") ? body.cardLast4! : "",
        totalAmount,
        nights,
        status: "pending",
        paymentStatus: body.paymentMethod === "online" ? "awaiting_payment" : "pay_at_hotel",
        transactionId: null,
        roomId: null,
        source: "online",
      },
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        transactionId: booking.transactionId,
      },
    });
  } catch (error) {
    console.error("[Bookings]", error);
    return NextResponse.json({ success: false, error: "Booking failed" }, { status: 500 });
  }
}
