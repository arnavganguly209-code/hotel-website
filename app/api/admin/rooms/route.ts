import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import { getContent, saveContent } from "@/lib/cms/store";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import { roomPublicSlug } from "@/lib/booking/utils";

export const dynamic = "force-dynamic";

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

  const rooms = content.rooms.map((room) => {
    const slug = roomPublicSlug(room);
    const inv = inventory.find((i) => i.roomSlug === slug);
    return {
      id: room.id,
      slug,
      name: room.name,
      description: room.description,
      price: room.price,
      breakfastPrice: room.breakfastPrice ?? 0,
      amenities: room.amenities ?? [],
      available: room.available !== false,
      maxGuests: room.maxGuests ?? 2,
      imageSrc: room.imageSrc,
      gallery: room.gallery ?? [],
      totalRooms: inv?.totalRooms ?? 1,
    };
  });

  return NextResponse.json({ success: true, rooms });
}

type PatchBody = {
  roomSlug: string;
  name?: string;
  description?: string;
  price?: number;
  breakfastPrice?: number;
  amenities?: string[];
  available?: boolean;
  maxGuests?: number;
  imageSrc?: string;
  gallery?: string[];
  totalRooms?: number;
};

export async function PATCH(req: Request) {
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
    const body = (await req.json()) as PatchBody;
    if (!body.roomSlug) {
      return NextResponse.json({ success: false, error: "roomSlug is required" }, { status: 400 });
    }

    const content = await getContent();
    const index = content.rooms.findIndex(
      (room) => room.id === body.roomSlug || roomPublicSlug(room) === body.roomSlug
    );
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });
    }

    const room = content.rooms[index];
    const updated = {
      ...room,
      name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : room.name,
      description: typeof body.description === "string" ? body.description : room.description,
      price: typeof body.price === "number" && Number.isFinite(body.price) ? body.price : room.price,
      breakfastPrice:
        typeof body.breakfastPrice === "number" && Number.isFinite(body.breakfastPrice)
          ? body.breakfastPrice
          : room.breakfastPrice,
      amenities: Array.isArray(body.amenities) ? body.amenities : room.amenities,
      available: typeof body.available === "boolean" ? body.available : room.available,
      maxGuests:
        typeof body.maxGuests === "number" && Number.isFinite(body.maxGuests)
          ? body.maxGuests
          : room.maxGuests,
      imageSrc: typeof body.imageSrc === "string" && body.imageSrc.trim() ? body.imageSrc : room.imageSrc,
      gallery: Array.isArray(body.gallery) ? body.gallery : room.gallery,
    };

    content.rooms[index] = updated;
    await saveContent(content);

    const slug = roomPublicSlug(updated);
    if (typeof body.totalRooms === "number" && Number.isFinite(body.totalRooms) && body.totalRooms >= 0) {
      const totalRooms = Math.max(1, Math.round(body.totalRooms));
      await db.roomInventory.upsert({
        where: { roomSlug: slug },
        create: { roomSlug: slug, totalRooms },
        update: { totalRooms },
      });
    }

    revalidateSiteContent();

    return NextResponse.json({ success: true, room: updated });
  } catch (error) {
    console.error("[AdminRooms]", error);
    return NextResponse.json({ success: false, error: "Unable to update room" }, { status: 500 });
  }
}
