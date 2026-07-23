import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import { assertBookingAvailability } from "@/lib/admin/availability";
import { getContent } from "@/lib/cms/store";
import {
  bookingDatesAreValid,
  calculateBookingTotal,
  calculateNights,
  roomPublicSlug,
} from "@/lib/booking/utils";

export const dynamic = "force-dynamic";

const BOOKING_STATUSES = new Set([
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
  "refunded",
  "payment_pending",
]);

const PAYMENT_STATUSES = new Set(["unpaid", "pending", "paid", "offline", "refunded"]);

export async function GET(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source")?.trim();
  const status = searchParams.get("status")?.trim();
  const q = searchParams.get("q")?.trim().toLowerCase();

  const bookings = await db.booking.findMany({ orderBy: { createdAt: "desc" } });

  const filtered = bookings.filter((b) => {
    if (source && source !== "all" && b.source !== source) return false;
    if (status && status !== "all" && b.status !== status) return false;
    if (q) {
      const hay = `${b.name} ${b.email} ${b.phone} ${b.roomName}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return NextResponse.json({ success: true, bookings: filtered });
}

export async function POST(req: Request) {
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

  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      whatsapp?: string;
      countryCode?: string;
      country?: string;
      checkIn: string;
      checkOut: string;
      guests?: number;
      children?: number;
      roomQuantity?: number;
      roomSlug: string;
      roomNumber?: string;
      breakfast?: string;
      specialRequests?: string;
      notes?: string;
      remarks?: string;
      status?: string;
      paymentStatus?: string;
      paymentMethod?: string;
      totalAmount?: number;
    };

    if (!body.name?.trim() || !body.roomSlug || !bookingDatesAreValid(body.checkIn, body.checkOut)) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const content = await getContent();
    const room = content.rooms.find(
      (candidate) => candidate.id === body.roomSlug || roomPublicSlug(candidate) === body.roomSlug
    );
    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 400 });
    }

    const guests = Math.max(1, Math.min(20, Number(body.guests) || 1));
    const children = Math.max(0, Math.min(10, Number(body.children) || 0));
    const roomQuantity = Math.max(1, Math.min(20, Number(body.roomQuantity) || 1));
    const breakfast = "with-breakfast";
    const nights = calculateNights(body.checkIn, body.checkOut);
    const slug = roomPublicSlug(room);
    const roomNumber = body.roomNumber?.trim() ?? "";

    if (roomNumber) {
      const unit = await db.roomUnit.findUnique({
        where: { roomSlug_roomNumber: { roomSlug: slug, roomNumber } },
      });
      if (!unit) {
        return NextResponse.json({ success: false, error: "Room number not found for this category." }, { status: 400 });
      }
      if (unit.status !== "available") {
        return NextResponse.json({ success: false, error: "Selected room number is not available." }, { status: 400 });
      }
    }

    const availability = await assertBookingAvailability({
      roomSlug: slug,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      roomQuantity,
    });
    if (!availability.ok) {
      return NextResponse.json({ success: false, error: availability.error }, { status: 400 });
    }

    const totalAmount =
      typeof body.totalAmount === "number" && Number.isFinite(body.totalAmount) && body.totalAmount >= 0
        ? Math.round(body.totalAmount)
        : calculateBookingTotal({ room, nights, roomQuantity, breakfast });

    const status = body.status && BOOKING_STATUSES.has(body.status) ? body.status : "confirmed";
    const paymentStatus =
      body.paymentStatus && PAYMENT_STATUSES.has(body.paymentStatus) ? body.paymentStatus : "offline";

    const { findRoomIdBySlug } = await import("@/lib/cms/sync-rooms");
    const roomId = await findRoomIdBySlug(slug);

    const remarksBase = body.remarks?.trim() ?? "";
    const remarks =
      roomNumber && !remarksBase.toLowerCase().includes(`room #${roomNumber}`.toLowerCase())
        ? [remarksBase, `Room #${roomNumber}`].filter(Boolean).join(" · ")
        : remarksBase;

    const booking = await db.booking.create({
      data: {
        name: body.name.trim(),
        email: body.email?.trim() ?? "",
        phone: body.phone?.trim() ?? "",
        whatsapp: body.whatsapp?.trim() ?? "",
        countryCode: body.countryCode ?? "",
        country: body.country?.trim() ?? "",
        checkIn: new Date(body.checkIn),
        checkOut: new Date(body.checkOut),
        guests,
        children,
        roomQuantity,
        roomSlug: slug,
        roomName: room.name,
        roomNumber,
        breakfast,
        specialRequests: body.specialRequests?.trim() ?? "",
        notes: body.notes?.trim() ?? "",
        remarks,
        source: "offline",
        paymentMethod: body.paymentMethod?.trim() || "hotel",
        totalAmount,
        nights,
        status,
        paymentStatus,
        roomId,
      },
    });

    if (roomNumber) {
      try {
        await db.roomUnit.update({
          where: { roomSlug_roomNumber: { roomSlug: slug, roomNumber } },
          data: { status: "occupied" },
        });
      } catch (unitError) {
        console.error("[AdminBookingsCreate] unit occupy best-effort", unitError);
      }
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("[AdminBookingsCreate]", error);
    return NextResponse.json({ success: false, error: "Unable to create booking" }, { status: 500 });
  }
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

  try {
    const body = (await req.json()) as {
      id?: number;
      status?: string;
      paymentStatus?: string;
      remarks?: string;
    };

    if (!body.id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (body.status) {
      if (!BOOKING_STATUSES.has(body.status)) {
        return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
      }
      data.status = body.status;
    }
    if (body.paymentStatus) {
      if (!PAYMENT_STATUSES.has(body.paymentStatus)) {
        return NextResponse.json({ success: false, error: "Invalid payment status" }, { status: 400 });
      }
      data.paymentStatus = body.paymentStatus;
    }
    if (typeof body.remarks === "string") {
      data.remarks = body.remarks;
    }

    const existing = await db.booking.findUnique({ where: { id: Number(body.id) } });
    const booking = await db.booking.update({ where: { id: Number(body.id) }, data });

    const releaseStatuses = new Set(["cancelled", "checked_out", "refunded"]);
    if (
      existing?.roomNumber &&
      existing.roomSlug &&
      body.status &&
      releaseStatuses.has(body.status)
    ) {
      try {
        await db.roomUnit.updateMany({
          where: {
            roomSlug: existing.roomSlug,
            roomNumber: existing.roomNumber,
            status: "occupied",
          },
          data: { status: "available" },
        });
      } catch (unitError) {
        console.error("[AdminBookingsUpdate] unit release best-effort", unitError);
      }
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("[AdminBookingsUpdate]", error);
    return NextResponse.json({ success: false, error: "Unable to update booking" }, { status: 500 });
  }
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

  try {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }
    const existing = await db.booking.findUnique({ where: { id } });
    await db.booking.delete({ where: { id } });
    if (existing?.roomNumber && existing.roomSlug) {
      try {
        await db.roomUnit.updateMany({
          where: {
            roomSlug: existing.roomSlug,
            roomNumber: existing.roomNumber,
            status: "occupied",
          },
          data: { status: "available" },
        });
      } catch (unitError) {
        console.error("[AdminBookingsDelete] unit release best-effort", unitError);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AdminBookingsDelete]", error);
    return NextResponse.json({ success: false, error: "Unable to delete booking" }, { status: 500 });
  }
}
