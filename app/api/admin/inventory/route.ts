import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import { getAvailableCount } from "@/lib/admin/availability";
import { getContent } from "@/lib/cms/store";
import { roomPublicSlug } from "@/lib/booking/utils";

export const dynamic = "force-dynamic";

function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const content = await getContent();
  const inventory = await db.roomInventory.findMany();

  const today = startOfDay();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const rooms = await Promise.all(
    content.rooms.map(async (room) => {
      const slug = roomPublicSlug(room);
      const inv = inventory.find((i) => i.roomSlug === slug);
      const totalRooms = inv?.totalRooms ?? 1;
      const availability = await getAvailableCount({
        roomSlug: slug,
        checkIn: isoDate(today),
        checkOut: isoDate(tomorrow),
        fallbackTotal: totalRooms,
      });
      return {
        roomSlug: slug,
        roomName: room.name,
        totalRooms,
        occupiedToday: availability.occupied,
        availableToday: availability.available,
        blockedToday: availability.blocked,
        updatedAt: inv?.updatedAt ?? null,
      };
    })
  );

  return NextResponse.json({ success: true, rooms });
}

export async function PUT(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as { roomSlug?: string; totalRooms?: number };
    if (!body.roomSlug?.trim() || typeof body.totalRooms !== "number" || !Number.isFinite(body.totalRooms) || body.totalRooms < 0) {
      return NextResponse.json(
        { success: false, error: "roomSlug and a valid totalRooms are required" },
        { status: 400 }
      );
    }

    const totalRooms = Math.max(1, Math.round(body.totalRooms));
    const inventory = await db.roomInventory.upsert({
      where: { roomSlug: body.roomSlug.trim() },
      create: { roomSlug: body.roomSlug.trim(), totalRooms },
      update: { totalRooms },
    });

    return NextResponse.json({ success: true, inventory });
  } catch (error) {
    console.error("[AdminInventory]", error);
    return NextResponse.json({ success: false, error: "Unable to update inventory" }, { status: 500 });
  }
}
