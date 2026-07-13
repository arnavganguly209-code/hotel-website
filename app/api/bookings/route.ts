import { isDatabaseAvailable, db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface BookingRecord {
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  children?: number;
  roomId: string;
}

export async function POST(req: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return Response.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = (await req.json()) as BookingRecord;

    const room = await db.room.findFirst({
      where: { name: { contains: body.roomId, mode: "insensitive" } },
    });

    const booking = await db.booking.create({
      data: {
        name: body.name,
        email: body.email,
        checkIn: new Date(body.checkIn),
        checkOut: new Date(body.checkOut),
        guests: Number(body.guests),
        roomId: room?.id ?? 1,
        status: "pending",
        paymentStatus: "unpaid",
      },
    });

    return Response.json({ success: true, booking });
  } catch (error) {
    console.error("[Bookings]", error);
    return Response.json({ success: false, error: "Booking failed" }, { status: 500 });
  }
}
