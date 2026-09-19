import { NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getAdminSessionUser } from "@/lib/admin/auth";
import { getMonthCalendarStock } from "@/lib/admin/availability";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const roomSlug = (url.searchParams.get("roomSlug") || "").trim();
  const year = Number(url.searchParams.get("year"));
  const month = Number(url.searchParams.get("month"));

  if (!roomSlug) {
    return NextResponse.json({ success: false, error: "roomSlug is required" }, { status: 400 });
  }
  if (!Number.isFinite(year) || year < 2020 || year > 2100) {
    return NextResponse.json({ success: false, error: "Invalid year" }, { status: 400 });
  }
  if (!Number.isFinite(month) || month < 1 || month > 12) {
    return NextResponse.json({ success: false, error: "Invalid month" }, { status: 400 });
  }

  const calendar = await getMonthCalendarStock({ roomSlug, year, month });
  return NextResponse.json(
    { success: true, calendar },
    { headers: { "Cache-Control": "no-store" } }
  );
}
