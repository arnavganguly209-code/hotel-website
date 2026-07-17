import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getContent } from "@/lib/cms/store";
import { sendDiningReservationEmails } from "@/lib/mail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function generateReferenceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `DIN-${y}${m}${d}-${suffix}`;
}

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status")?.trim();
  const q = searchParams.get("q")?.trim().toLowerCase();
  const restaurant = searchParams.get("restaurant")?.trim();
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();

  const reservations = await db.diningReservation.findMany({
    orderBy: { createdAt: "desc" },
  });

  const filtered = reservations.filter((item) => {
    if (status && status !== "all" && item.status !== status) return false;
    if (restaurant && restaurant !== "all" && item.restaurant !== restaurant) return false;
    if (from) {
      const fromDate = new Date(from);
      if (item.createdAt < fromDate) return false;
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      if (item.createdAt > toDate) return false;
    }
    if (q) {
      const hay =
        `${item.referenceNumber} ${item.fullName} ${item.email} ${item.phone} ${item.restaurant}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return NextResponse.json({ success: true, reservations: filtered });
}

export async function POST(req: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const country = String(formData.get("country") || "").trim();
    const restaurant = String(formData.get("restaurant") || "").trim();
    const reservationDateRaw = String(formData.get("reservationDate") || "").trim();
    const reservationTime = String(formData.get("reservationTime") || "").trim();
    const adultsRaw = String(formData.get("adults") || "").trim();
    const childrenRaw = String(formData.get("children") || "").trim();
    const specialOccasion = String(formData.get("specialOccasion") || "").trim();
    const specialRequest = String(formData.get("specialRequest") || "").trim();
    const consent =
      String(formData.get("consent") || "") === "on" || formData.get("consent") === "true";

    if (!fullName || !email || !restaurant) {
      return NextResponse.json(
        { success: false, error: "Full name, email, and restaurant are required." },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { success: false, error: "Please accept the consent checkbox to continue." },
        { status: 400 }
      );
    }

    const adults = adultsRaw ? Number(adultsRaw) : 2;
    const children = childrenRaw ? Number(childrenRaw) : 0;

    const referenceNumber = generateReferenceNumber();

    const reservation = await db.diningReservation.create({
      data: {
        referenceNumber,
        fullName,
        email,
        phone,
        country,
        restaurant,
        reservationDate: reservationDateRaw ? new Date(reservationDateRaw) : null,
        reservationTime,
        adults: Number.isFinite(adults) ? adults : 2,
        children: Number.isFinite(children) ? children : 0,
        specialOccasion,
        specialRequest,
        consent,
        status: "new",
      },
    });

    const content = await getContent();
    const adminEmail =
      content.settings.bookingEmail || content.contactPage.email || content.hotel.email;

    const mail = await sendDiningReservationEmails(
      {
        referenceNumber,
        fullName,
        email,
        phone,
        country,
        restaurant,
        reservationDate: reservationDateRaw || null,
        reservationTime,
        adults: Number.isFinite(adults) ? adults : 2,
        children: Number.isFinite(children) ? children : 0,
        specialOccasion,
        specialRequest,
      },
      adminEmail
    );

    return NextResponse.json({
      success: true,
      reservation: { id: reservation.id, referenceNumber: reservation.referenceNumber },
      email: mail,
    });
  } catch (error) {
    console.error("[DiningReservations]", error);
    return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 });
  }
}
