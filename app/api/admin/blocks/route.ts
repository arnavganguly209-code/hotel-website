import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const ALLOWED_REASONS = new Set([
  "maintenance",
  "renovation",
  "private_event",
  "owner_use",
  "other",
]);

export async function GET() {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const blocks = await db.roomBlock.findMany({ orderBy: { startDate: "desc" } });
  return NextResponse.json({ success: true, blocks });
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
      startDate?: string;
      endDate?: string;
      reason?: string;
      notes?: string;
    };

    if (!body.roomSlug?.trim() || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { success: false, error: "roomSlug, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const start = new Date(`${body.startDate}T00:00:00.000Z`);
    const end = new Date(`${body.endDate}T00:00:00.000Z`);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
      return NextResponse.json({ success: false, error: "Invalid date range" }, { status: 400 });
    }

    const reason = body.reason && ALLOWED_REASONS.has(body.reason) ? body.reason : "other";

    const block = await db.roomBlock.create({
      data: {
        roomSlug: body.roomSlug.trim(),
        startDate: start,
        endDate: end,
        reason,
        notes: body.notes?.trim() ?? "",
      },
    });

    return NextResponse.json({ success: true, block });
  } catch (error) {
    console.error("[AdminBlocks]", error);
    return NextResponse.json({ success: false, error: "Unable to create block" }, { status: 500 });
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

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  }

  await db.roomBlock.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
