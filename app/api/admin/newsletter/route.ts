import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

function csvEscape(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase();
  const status = searchParams.get("status")?.trim();
  const exportFormat = searchParams.get("export")?.trim();

  const subscribers = await db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });

  const filtered = subscribers.filter((s) => {
    if (status && status !== "all" && s.status !== status) return false;
    if (q && !s.email.toLowerCase().includes(q)) return false;
    return true;
  });

  if (exportFormat === "csv") {
    const headers = ["ID", "Email", "Status", "Subscribed At"];
    const rows = filtered.map((s) =>
      [s.id, s.email, s.status, s.createdAt.toISOString()].map(csvEscape).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="newsletter-subscribers-${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json({ success: true, subscribers: filtered });
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

  await db.newsletterSubscriber.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
