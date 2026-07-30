import { NextResponse } from "next/server";
import { getAdminSessionUser } from "@/lib/admin/auth";
import { sendCheckinRemindersForDate } from "@/lib/email/booking-notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Cron-friendly endpoint for automatic check-in reminders.
 * Secure with CRON_SECRET header when set.
 */
export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret) {
    const provided = req.headers.get("x-cron-secret") || "";
    if (provided !== cronSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  } else {
    const user = await getAdminSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = (await req.json().catch(() => ({}))) as { date?: string };
  const day =
    body.date ||
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const result = await sendCheckinRemindersForDate(day);
  return NextResponse.json({ success: true, date: day, ...result });
}
