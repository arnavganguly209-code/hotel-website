import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getAdminSessionUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      const hay = `${item.fullName} ${item.email} ${item.phone}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return NextResponse.json({ success: true, inquiries: filtered });
}

export async function POST(req: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      fullName?: string;
      email?: string;
      phone?: string;
      preferredDate?: string;
      preferredTime?: string;
      treatment?: string;
      guests?: number;
      specialRequest?: string;
    };

    const fullName = body.fullName?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    if (!fullName || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: "Full name and a valid email are required." },
        { status: 400 }
      );
    }

    const guests = Math.max(1, Math.min(10, Number(body.guests) || 1));
    const preferredDate = body.preferredDate ? new Date(body.preferredDate) : null;

    const inquiry = await db.spaInquiry.create({
      data: {
        fullName,
        email,
        phone: body.phone?.trim() ?? "",
        preferredDate: preferredDate && Number.isFinite(preferredDate.getTime()) ? preferredDate : null,
        preferredTime: body.preferredTime?.trim() ?? "",
        treatment: body.treatment?.trim() ?? "",
        guests,
        specialRequest: body.specialRequest?.trim() ?? "",
        status: "new",
      },
    });

    return NextResponse.json({ success: true, inquiry: { id: inquiry.id } });
  } catch (error) {
    console.error("[SpaInquiries]", error);
    return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 });
  }
}
