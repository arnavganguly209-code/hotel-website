import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const ALLOWED_STATUS = new Set(["new", "pending", "contacted", "completed", "archived"]);

export async function GET(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status")?.trim();
  const q = searchParams.get("q")?.trim().toLowerCase();

  const inquiries = await db.spaInquiry.findMany({ orderBy: { createdAt: "desc" } });
  const filtered = inquiries.filter((item) => {
    if (status && status !== "all" && item.status !== status) return false;
    if (q) {
      const hay = `${item.fullName} ${item.email} ${item.phone} ${item.treatment}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return NextResponse.json({ success: true, inquiries: filtered });
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

  const body = (await req.json()) as { id?: number; status?: string; adminNotes?: string };
  if (!body.id) {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  }
  const status = body.status && ALLOWED_STATUS.has(body.status) ? body.status : undefined;

  const inquiry = await db.spaInquiry.update({
    where: { id: Number(body.id) },
    data: {
      status,
      adminNotes: body.adminNotes ?? undefined,
    },
  });

  return NextResponse.json({ success: true, inquiry });
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
  const id = Number(searchParams.get("id"));
  if (!Number.isFinite(id)) {
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  }

  await db.spaInquiry.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
