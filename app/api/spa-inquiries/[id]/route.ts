import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const ALLOWED_STATUS = new Set(["new", "pending", "contacted", "completed", "archived"]);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const inquiryId = Number(id);
  if (!Number.isFinite(inquiryId)) {
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json()) as { status?: string; adminNotes?: string };
  const status = body.status && ALLOWED_STATUS.has(body.status) ? body.status : undefined;

  const inquiry = await db.spaInquiry.update({
    where: { id: inquiryId },
    data: {
      status,
      adminNotes: body.adminNotes ?? undefined,
    },
  });

  return NextResponse.json({ success: true, inquiry });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const inquiryId = Number(id);
  if (!Number.isFinite(inquiryId)) {
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  }

  await db.spaInquiry.delete({ where: { id: inquiryId } });
  return NextResponse.json({ success: true });
}
