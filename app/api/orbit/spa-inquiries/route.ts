import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { db, isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const items = await db.spaInquiry.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, items }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await db.spaInquiry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
