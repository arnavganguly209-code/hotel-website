import { NextResponse } from "next/server";
import { isDatabaseAvailable, db } from "@/lib/db";

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
    };

    if (!body.name || !body.email || !body.checkIn || !body.checkOut || !body.roomSlug) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const booking = await db.booking.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone ?? "",
        country: body.country ?? "",
        checkIn: new Date(body.checkIn),
        checkOut: new Date(body.checkOut),
        guests: Number(body.guests) || 1,
        children: Number(body.children) || 0,
        roomQuantity: Number(body.roomQuantity) || 1,
        roomSlug: body.roomSlug,
        roomName: body.roomName,
        breakfast: body.breakfast ?? "room-only",
        specialRequests: body.specialRequests ?? "",
        paymentMethod: body.paymentMethod ?? "hotel",
        totalAmount: Number(body.totalAmount) || 0,
        nights: Number(body.nights) || 1,
        status: "pending",
        paymentStatus: body.paymentMethod === "online" ? "awaiting_payment" : "pay_at_hotel",
        transactionId: null,
        roomId: null,
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
