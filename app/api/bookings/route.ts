import { NextResponse } from "next/server";
import { isDatabaseAvailable, db } from "@/lib/db";
import { getContent } from "@/lib/cms/store";
import { assertBookingAvailability } from "@/lib/admin/availability";
import {
  bookingDatesAreValid,
  calculateExtraGuestBreakdown,
  calculateNights,
  roomFitsOccupancy,
  roomPublicSlug,
} from "@/lib/booking/utils";
import { taxFieldsFromInclusiveTotal } from "@/lib/booking/tax-snapshot";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    console.info("[Bookings] Booking request received");

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

    console.info("[Bookings] Booking validated", {
      email: body.email,
      roomSlug: body.roomSlug,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
    });

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

    const guests = Math.max(1, Math.min(20, Number(body.guests) || 1));
    const children = Math.max(0, Math.min(20, Number(body.children) || 0));
    const roomQuantity = Math.max(1, Math.min(20, Number(body.roomQuantity) || 1));
    if (!roomFitsOccupancy(room, guests, children, roomQuantity)) {
      return NextResponse.json(
        { success: false, error: "Guest count exceeds this room’s maximum occupancy." },
        { status: 400 }
      );
    }
    const breakfast = "with-breakfast";
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

    const price = calculateExtraGuestBreakdown({
      room,
      adults: guests,
      children,
      nights,
      roomQuantity,
    });
    const tax = taxFieldsFromInclusiveTotal(price.grandTotal);

    const slug = roomPublicSlug(room);
    const { findRoomIdBySlug } = await import("@/lib/cms/sync-rooms");
    const roomId = await findRoomIdBySlug(slug);

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
        roomSlug: slug,
        roomName: room.name,
        breakfast,
        specialRequests: body.specialRequests ?? "",
        promoCode: body.promoCode ?? "",
        arrivalTime: body.arrivalTime ?? "",
        flightNumber: body.flightNumber ?? "",
        notes: body.notes ?? "",
        paymentMethod: body.paymentMethod,
        cardLast4: /^\d{4}$/.test(body.cardLast4 || "") ? body.cardLast4! : "",
        totalAmount: tax.totalAmount,
        displayPrice: tax.displayPrice,
        basePrice: tax.basePrice,
        vatRate: tax.vatRate,
        vatAmount: tax.vatAmount,
        grandTotal: tax.grandTotal,
        currency: tax.currency,
        nights,
        status: "pending",
        paymentStatus: body.paymentMethod === "online" ? "awaiting_payment" : "pay_at_hotel",
        transactionId: null,
        roomId,
        source: "online",
      },
    });

    console.info("[Bookings] Booking saved to database", { bookingId: booking.id });

    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ipAddress = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
    const userAgent = req.headers.get("user-agent") || "";

    let emailResult = { guestSent: false, adminSent: false };
    try {
      console.info("[Bookings] Preparing booking emails", { bookingId: booking.id });
      const { sendRoomBookingEmails } = await import("@/lib/mail");
      emailResult = await sendRoomBookingEmails(
        {
          id: booking.id,
          name: body.name,
          email: body.email,
          phone: body.phone,
          country: body.country,
          specialRequests: body.specialRequests ?? "",
          roomName: room.name,
          checkIn: body.checkIn,
          checkOut: body.checkOut,
          nights,
          adults: guests,
          children,
          roomQuantity,
          roomSubtotal: price.roomSubtotal,
          extraGuestCharge: price.total,
          displayPrice: tax.displayPrice,
          basePrice: tax.basePrice,
          vatRate: tax.vatRate,
          vatAmount: tax.vatAmount,
          grandTotal: tax.grandTotal,
          currency: tax.currency,
          paymentMethod: body.paymentMethod,
          bookingStatus: booking.status,
          paymentStatus: booking.paymentStatus,
          bookingDate: booking.createdAt.toISOString().slice(0, 10),
          bookingTime: booking.createdAt.toISOString(),
          ipAddress,
          userAgent,
          voucherUrl: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ""}/api/bookings/${booking.id}/voucher?email=${encodeURIComponent(body.email)}`,
        },
        "booking@hotelthamelpark.com"
      );
      console.info("[Bookings] Booking email workflow completed", {
        bookingId: booking.id,
        guestSent: emailResult.guestSent,
        adminSent: emailResult.adminSent,
      });
    } catch (err) {
      console.error(
        "[Bookings] email workflow crashed (booking still saved):",
        err instanceof Error ? err.stack || err.message : err
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        transactionId: booking.transactionId,
        roomSubtotal: price.roomSubtotal,
        extraGuestCharge: price.total,
        displayPrice: tax.displayPrice,
        basePrice: tax.basePrice,
        vatRate: tax.vatRate,
        vatAmount: tax.vatAmount,
        grandTotal: tax.grandTotal,
        currency: tax.currency,
        voucherUrl: `/api/bookings/${booking.id}/voucher?email=${encodeURIComponent(body.email)}`,
        email: emailResult,
      },
    });
  } catch (error) {
    console.error("[Bookings]", error);
    return NextResponse.json({ success: false, error: "Booking failed" }, { status: 500 });
  }
}
