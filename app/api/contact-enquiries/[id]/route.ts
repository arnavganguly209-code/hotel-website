import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { db, isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED_STATUS = new Set([
  "inbox",
  "archived",
  "spam",
  "trash",
  // legacy aliases still accepted from older Orbit UI
  "new",
  "pending",
  "contacted",
  "completed",
]);

function normalizeStatus(status?: string): string | undefined {
  if (!status || !ALLOWED_STATUS.has(status)) return undefined;
  if (status === "new" || status === "pending" || status === "contacted" || status === "completed") {
    return "inbox";
  }
  return status;
}

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

  const body = (await req.json()) as {
    status?: string;
    adminNotes?: string;
    isRead?: boolean;
    starred?: boolean;
    replied?: boolean;
  };
  const status = normalizeStatus(body.status);

  const inquiry = await db.contactEnquiry.update({
    where: { id: inquiryId },
    data: {
      status,
      adminNotes: body.adminNotes ?? undefined,
      isRead: typeof body.isRead === "boolean" ? body.isRead : undefined,
      starred: typeof body.starred === "boolean" ? body.starred : undefined,
      replied: typeof body.replied === "boolean" ? body.replied : undefined,
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

  await db.contactEnquiry.delete({ where: { id: inquiryId } });
  return NextResponse.json({ success: true });
}
