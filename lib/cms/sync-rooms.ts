import type { SiteContent } from "./types";
import { roomPublicSlug } from "@/lib/booking/utils";
import { db } from "@/lib/db";

/**
 * Keep Prisma Room (+ RoomInventory) rows in sync with CMS content.rooms.
 * CMS remains the rich catalog; Room is the relational booking source of truth.
 */
export async function syncRoomsFromCms(
  rooms: SiteContent["rooms"]
): Promise<{ upserted: number; removed: number }> {
  const slugs = new Set<string>();
  let upserted = 0;

  for (const room of rooms) {
    const slug = roomPublicSlug(room);
    if (!slug) continue;
    slugs.add(slug);

    const name = (room.name || slug).trim() || slug;
    const description = (room.description || room.longDescription || "").trim() || name;
    const price = Math.max(0, Math.round(Number(room.price) || 0));
    const image = room.imageSrc?.trim() || null;

    await db.room.upsert({
      where: { slug },
      create: { slug, name, description, price, image },
      update: { name, description, price, image },
    });

    await db.roomInventory.upsert({
      where: { roomSlug: slug },
      create: { roomSlug: slug, totalRooms: 1 },
      update: {},
    });

    upserted += 1;
  }

  let removed = 0;
  const existing = await db.room.findMany({ select: { id: true, slug: true } });
  for (const row of existing) {
    if (slugs.has(row.slug)) continue;
    const bookingCount = await db.booking.count({ where: { roomId: row.id } });
    if (bookingCount > 0) continue;
    await db.room.delete({ where: { id: row.id } });
    removed += 1;
  }

  return { upserted, removed };
}

export async function findRoomIdBySlug(slug: string): Promise<number | null> {
  if (!slug) return null;
  const row = await db.room.findUnique({
    where: { slug },
    select: { id: true },
  });
  return row?.id ?? null;
}
