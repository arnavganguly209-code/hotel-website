/**
 * One-shot: align Orbit CMS rooms with the 3-category homepage design.
 * Safe to re-run. Does not print secrets.
 *
 * Usage (VPS): npx tsx scripts/sync-rooms-homepage-layout.ts
 */
import { PrismaClient } from "@prisma/client";
import { defaultContent } from "../lib/cms/default-content";
import { mergeWithDefaults } from "../lib/cms/merge";
import type { SiteContent } from "../lib/cms/types";

const RECORD_ID = "main";
const prisma = new PrismaClient();

const ROOM_PATCH: Record<
  string,
  Partial<SiteContent["rooms"][number]>
> = Object.fromEntries(
  defaultContent.rooms.map((room) => [
    room.id,
    {
      name: room.name,
      slug: room.slug,
      price: room.price,
      size: room.size,
      bedType: room.bedType,
      guests: room.guests,
      features: room.features,
      amenities: room.amenities,
      description: room.description,
      longDescription: room.longDescription,
      order: room.order,
      visible: room.visible,
      available: room.available,
      exploreText: room.exploreText || "Explore Room",
      imageSrc: room.imageSrc,
      gallery: room.gallery,
    },
  ])
);

async function main() {
  const record = await prisma.siteContentRecord.findUnique({ where: { id: RECORD_ID } });
  if (!record?.content) {
    throw new Error("SiteContentRecord main not found");
  }

  const current = mergeWithDefaults(record.content as Partial<SiteContent>);
  const nextRooms = current.rooms.map((room) => {
    const patch = ROOM_PATCH[room.id];
    if (!patch) return room;
    return { ...room, ...patch };
  });

  // Ensure all default rooms exist (e.g. if CMS missing one id)
  for (const def of defaultContent.rooms) {
    if (!nextRooms.some((r) => r.id === def.id)) {
      nextRooms.push({ ...def });
    }
  }

  const next: SiteContent = {
    ...current,
    rooms: nextRooms,
    roomsSection: {
      ...current.roomsSection,
      ...defaultContent.roomsSection,
    },
  };

  await prisma.siteContentRecord.update({
    where: { id: RECORD_ID },
    data: { content: next as object },
  });

  // Keep relational Room table aligned
  const { syncRoomsFromCms } = await import("../lib/cms/sync-rooms");
  await syncRoomsFromCms(next.rooms);

  const shown = next.rooms
    .filter((r) => r.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 3)
    .map((r) => `${r.name} ($${r.price})`);

  console.log("CMS rooms homepage layout synced.");
  console.log("Homepage 3 rooms:", shown.join(" | "));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
