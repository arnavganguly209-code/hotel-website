import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import { getContent, saveContent } from "@/lib/cms/store";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import { isLiveRoomCategory, roomPublicSlug } from "@/lib/booking/utils";
import type { MediaAsset, SiteContent } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

type CmsRoom = SiteContent["rooms"][number];

function finiteNumber(value: unknown, fallback: number | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
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

  const rooms = content.rooms.filter(isLiveRoomCategory).map((room) => {
    const slug = roomPublicSlug(room);
    const inv = inventory.find((i) => i.roomSlug === slug);
    return {
      id: room.id,
      slug,
      name: room.name,
      description: room.description,
      longDescription: room.longDescription || "",
      price: room.price,
      breakfastPrice: room.breakfastPrice ?? 0,
      amenities: room.amenities ?? [],
      available: room.available !== false,
      visible: room.visible !== false,
      maxGuests: room.maxGuests ?? 2,
      guests: room.guests || "",
      size: room.size || "",
      bedType: room.bedType || "",
      baseAdults: room.baseAdults ?? 2,
      baseChildren: room.baseChildren ?? 1,
      maxAdults: room.maxAdults ?? 2,
      maxChildren: room.maxChildren ?? 1,
      extraAdultPrice: room.extraAdultPrice ?? 0,
      extraChildPrice: room.extraChildPrice ?? 0,
      imageSrc: room.imageSrc,
      gallery: room.gallery ?? [],
      totalRooms: inv?.totalRooms ?? 1,
    };
  });

  return NextResponse.json({
    success: true,
    rooms,
    mediaLibrary: content.mediaLibrary || [],
  });
}

type PatchBody = {
  roomSlug: string;
  name?: string;
  description?: string;
  longDescription?: string;
  price?: number;
  breakfastPrice?: number;
  amenities?: string[];
  available?: boolean;
  visible?: boolean;
  maxGuests?: number;
  guests?: string;
  size?: string;
  bedType?: string;
  baseAdults?: number;
  baseChildren?: number;
  maxAdults?: number;
  maxChildren?: number;
  extraAdultPrice?: number;
  extraChildPrice?: number;
  imageSrc?: string;
  gallery?: string[];
  totalRooms?: number;
  mediaLibrary?: MediaAsset[];
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
    const updated: CmsRoom = {
      ...room,
      name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : room.name,
      description: typeof body.description === "string" ? body.description : room.description,
      longDescription:
        typeof body.longDescription === "string" ? body.longDescription : room.longDescription,
      guests: typeof body.guests === "string" ? body.guests : room.guests,
      size: typeof body.size === "string" ? body.size : room.size,
      bedType: typeof body.bedType === "string" ? body.bedType : room.bedType,
      price: finiteNumber(body.price, room.price) ?? room.price,
      breakfastPrice: finiteNumber(body.breakfastPrice, room.breakfastPrice),
      amenities: Array.isArray(body.amenities) ? body.amenities : room.amenities,
      available: typeof body.available === "boolean" ? body.available : room.available,
      visible: typeof body.visible === "boolean" ? body.visible : room.visible,
      maxGuests: finiteNumber(body.maxGuests, room.maxGuests),
      baseAdults: finiteNumber(body.baseAdults, room.baseAdults),
      baseChildren: finiteNumber(body.baseChildren, room.baseChildren),
      maxAdults: finiteNumber(body.maxAdults, room.maxAdults),
      maxChildren: finiteNumber(body.maxChildren, room.maxChildren),
      extraAdultPrice: finiteNumber(body.extraAdultPrice, room.extraAdultPrice),
      extraChildPrice: finiteNumber(body.extraChildPrice, room.extraChildPrice),
      imageSrc: typeof body.imageSrc === "string" ? body.imageSrc : room.imageSrc,
      gallery: Array.isArray(body.gallery) ? body.gallery.filter(Boolean) : room.gallery,
    };

    content.rooms[index] = updated;
    if (Array.isArray(body.mediaLibrary)) {
      content.mediaLibrary = body.mediaLibrary;
    }
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
