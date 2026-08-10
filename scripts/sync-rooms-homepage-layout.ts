/**
 * One-shot: align Orbit CMS rooms with the 3-category homepage design.
 * Safe to re-run. Does not print secrets.
 *
 * Usage (VPS): set -a && . ./.env && set +a && npx tsx scripts/sync-rooms-homepage-layout.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

loadEnv({ path: resolve(process.cwd(), ".env") });

async function main() {
  const { db } = await import("../lib/db");
  const { defaultContent } = await import("../lib/cms/default-content");
  const { mergeWithDefaults } = await import("../lib/cms/merge");
  const { syncRoomsFromCms } = await import("../lib/cms/sync-rooms");
  type SiteContent = import("../lib/cms/types").SiteContent;

  const RECORD_ID = "main";

  const ROOM_PATCH: Record<string, Partial<SiteContent["rooms"][number]>> =
    Object.fromEntries(
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

  const record = await db.siteContentRecord.findUnique({ where: { id: RECORD_ID } });
  if (!record?.content) {
    throw new Error("SiteContentRecord main not found");
  }

  const current = mergeWithDefaults(record.content as Partial<SiteContent>);
  const nextRooms = current.rooms.map((room) => {
    const patch = ROOM_PATCH[room.id];
    if (!patch) return room;
    return { ...room, ...patch };
  });

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

  await db.siteContentRecord.update({
    where: { id: RECORD_ID },
    data: { content: next as object },
  });

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
    try {
      const { db } = await import("../lib/db");
      await db.$disconnect();
    } catch {
      /* ignore */
    }
  });
