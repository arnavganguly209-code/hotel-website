import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import {
  getAvailableCount,
  parseInventoryOverrides,
  type InventoryOverrides,
} from "@/lib/admin/availability";
import { getContent } from "@/lib/cms/store";
import { isLiveRoomCategory, roomPublicSlug } from "@/lib/booking/utils";

export const dynamic = "force-dynamic";

function localIsoDate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysLocal(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return localIsoDate(dt);
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

  const checkIn = localIsoDate();
  const checkOut = addDaysLocal(checkIn, 1);

  const rooms = await Promise.all(
    content.rooms.filter(isLiveRoomCategory).map(async (room) => {
      const slug = roomPublicSlug(room);
      const inv = inventory.find((i) => i.roomSlug === slug);
      const totalRooms = inv?.totalRooms ?? 1;
      const overrides = parseInventoryOverrides(inv?.overrides);
      const availability = await getAvailableCount({
        roomSlug: slug,
        checkIn,
        checkOut,
        fallbackTotal: totalRooms,
      });
      return {
        roomSlug: slug,
        roomName: room.name,
        totalRooms,
        occupiedToday: availability.occupied,
        availableToday: availability.available,
        blockedToday: availability.blocked,
        cappedToday: availability.cappedTotal,
        overrides,
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
    const body = (await req.json()) as {
      roomSlug?: string;
      totalRooms?: number;
      overrides?: InventoryOverrides;
      mergeOverrides?: boolean;
    };

    if (!body.roomSlug?.trim()) {
      return NextResponse.json({ success: false, error: "roomSlug is required" }, { status: 400 });
    }

    const roomSlug = body.roomSlug.trim();
    const existing = await db.roomInventory.findUnique({ where: { roomSlug } });

    const data: { totalRooms?: number; overrides?: InventoryOverrides } = {};

    if (typeof body.totalRooms === "number" && Number.isFinite(body.totalRooms)) {
      data.totalRooms = Math.max(1, Math.round(body.totalRooms));
    }

    if (body.overrides) {
      const incoming = parseInventoryOverrides(body.overrides);
      if (body.mergeOverrides) {
        const prev = parseInventoryOverrides(existing?.overrides);
        data.overrides = {
          monthly: { ...(prev.monthly || {}), ...(incoming.monthly || {}) },
          daily: { ...(prev.daily || {}), ...(incoming.daily || {}) },
        };
      } else {
        data.overrides = incoming;
      }
    }

    if (!data.totalRooms && !data.overrides) {
      return NextResponse.json(
        { success: false, error: "Provide totalRooms and/or overrides" },
        { status: 400 }
      );
    }

    const inventory = await db.roomInventory.upsert({
      where: { roomSlug },
      create: {
        roomSlug,
        totalRooms: data.totalRooms ?? existing?.totalRooms ?? 1,
        overrides: data.overrides ?? {},
      },
      update: data,
    });

    return NextResponse.json({
      success: true,
      inventory: {
        ...inventory,
        overrides: parseInventoryOverrides(inventory.overrides),
      },
    });
  } catch (error) {
    console.error("[AdminInventory]", error);
    return NextResponse.json({ success: false, error: "Unable to update inventory" }, { status: 500 });
  }
}
