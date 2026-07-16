import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { db, isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  const inquiryId = Number(id);
  if (!Number.isFinite(inquiryId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json()) as { adminReply?: string; status?: string };
  const inquiry = await db.eventInquiry.update({
    where: { id: inquiryId },
    data: {
      adminReply: body.adminReply ?? undefined,
      status: body.status ?? undefined,
    },
  });

  return NextResponse.json({ success: true, inquiry });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  const inquiryId = Number(id);
  if (!Number.isFinite(inquiryId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await db.eventInquiry.delete({ where: { id: inquiryId } });
  return NextResponse.json({ success: true });
}
