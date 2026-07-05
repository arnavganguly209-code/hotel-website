import { promises as fs } from "fs";
import path from "path";

const BOOKINGS_PATH = path.join(process.cwd(), "data", "bookings.json");

interface BookingRecord {
  id: number;
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  children?: number;
  roomId: string;
  createdAt: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const booking: BookingRecord = {
      id: Date.now(),
      name: body.name,
      email: body.email,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: Number(body.guests),
      children: body.children ? Number(body.children) : 0,
      roomId: String(body.roomId ?? ""),
      createdAt: new Date().toISOString(),
    };

    let bookings: BookingRecord[] = [];
    try {
      bookings = JSON.parse(await fs.readFile(BOOKINGS_PATH, "utf-8")) as BookingRecord[];
    } catch {
      bookings = [];
    }

    bookings.push(booking);
    await fs.mkdir(path.dirname(BOOKINGS_PATH), { recursive: true });
    await fs.writeFile(BOOKINGS_PATH, JSON.stringify(bookings, null, 2), "utf-8");

    return Response.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: "Booking failed" }, { status: 500 });
  }
}
