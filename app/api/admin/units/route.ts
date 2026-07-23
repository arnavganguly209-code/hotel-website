import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const UNIT_STATUSES = new Set(["available", "occupied", "maintenance"]);

export async function GET(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const roomSlug = new URL(req.url).searchParams.get("roomSlug")?.trim();
  const units = await db.roomUnit.findMany({
    where: roomSlug ? { roomSlug } : undefined,
    orderBy: [{ roomSlug: "asc" }, { roomNumber: "asc" }],
  });

  return NextResponse.json({ success: true, units });
}

export async function POST(req: Request) {
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
      roomNumber?: string;
      status?: string;
      notes?: string;
    };

    const roomSlug = body.roomSlug?.trim() ?? "";
    const roomNumber = body.roomNumber?.trim() ?? "";
    if (!roomSlug || !roomNumber) {
      return NextResponse.json(
        { success: false, error: "roomSlug and roomNumber are required" },
        { status: 400 }
      );
    }

    const status =
      body.status && UNIT_STATUSES.has(body.status) ? body.status : "available";

    const unit = await db.roomUnit.create({
      data: {
        roomSlug,
        roomNumber,
        status,
        notes: body.notes?.trim() ?? "",
      },
    });

    return NextResponse.json({ success: true, unit });
  } catch (error) {
    console.error("[AdminUnitsCreate]", error);
    const message =
      error && typeof error === "object" && "code" in error && error.code === "P2002"
        ? "That room number already exists for this category."
        : "Unable to create room unit";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

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
    const body = (await req.json()) as {
      id?: string;
      roomNumber?: string;
      status?: string;
      notes?: string;
    };

    if (!body.id?.trim()) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (typeof body.roomNumber === "string" && body.roomNumber.trim()) {
      data.roomNumber = body.roomNumber.trim();
    }
    if (body.status) {
      if (!UNIT_STATUSES.has(body.status)) {
        return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
      }
      data.status = body.status;
    }
    if (typeof body.notes === "string") {
      data.notes = body.notes;
    }

    const unit = await db.roomUnit.update({
      where: { id: body.id.trim() },
      data,
    });

    return NextResponse.json({ success: true, unit });
  } catch (error) {
    console.error("[AdminUnitsUpdate]", error);
    return NextResponse.json({ success: false, error: "Unable to update room unit" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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
    const id = new URL(req.url).searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }
    await db.roomUnit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AdminUnitsDelete]", error);
    return NextResponse.json({ success: false, error: "Unable to delete room unit" }, { status: 500 });
  }
}
