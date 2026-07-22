import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { db, isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Orbit source-of-truth access to the same Booking rows Admin PMS uses. */
export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source")?.trim();
  const q = searchParams.get("q")?.trim().toLowerCase();

  const bookings = await db.booking.findMany({ orderBy: { createdAt: "desc" } });
  const filtered = bookings.filter((b) => {
    if (source && source !== "all" && b.source !== source) return false;
    if (q) {
      const hay = `${b.name} ${b.email} ${b.phone} ${b.roomName}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return NextResponse.json(
    { success: true, bookings: filtered },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PATCH(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = (await req.json()) as {
    id?: number;
    status?: string;
    paymentStatus?: string;
    remarks?: string;
  };
  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const booking = await db.booking.update({
    where: { id: Number(body.id) },
    data: {
      status: body.status,
      paymentStatus: body.paymentStatus,
      remarks: body.remarks,
    },
  });
  return NextResponse.json({ success: true, booking });
}

export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await db.booking.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
