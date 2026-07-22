import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getAdminSessionUser } from "@/lib/admin/auth";
import { getContent } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function GET() {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) return NextResponse.json({ success: false }, { status: 401 });

  const today = startOfDay();
  const month = startOfMonth();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    todaysBookings,
    pending,
    confirmed,
    cancelled,
    offline,
    online,
    todayRevenueAgg,
    monthRevenueAgg,
    unpaid,
    paid,
    contactToday,
    diningToday,
    spaToday,
    meetingsToday,
    newsletter,
    inventory,
    blocks,
    visitToday,
    recentBookings,
  ] = await Promise.all([
    db.booking.count({ where: { createdAt: { gte: today } } }),
    db.booking.count({ where: { status: "pending" } }),
    db.booking.count({ where: { status: "confirmed" } }),
    db.booking.count({ where: { status: "cancelled" } }),
    db.booking.count({ where: { source: "offline" } }),
    db.booking.count({ where: { source: "online" } }),
    db.booking.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: today },
        paymentStatus: { in: ["paid", "offline"] },
        status: { not: "cancelled" },
      },
    }),
    db.booking.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: month },
        paymentStatus: { in: ["paid", "offline"] },
        status: { not: "cancelled" },
      },
    }),
    db.booking.count({ where: { paymentStatus: { in: ["unpaid", "pending"] } } }),
    db.booking.count({ where: { paymentStatus: { in: ["paid", "offline"] } } }),
    db.contactEnquiry.count({ where: { createdAt: { gte: today } } }),
    db.diningReservation.count({ where: { createdAt: { gte: today } } }),
    db.spaInquiry.count({ where: { createdAt: { gte: today } } }),
    db.eventInquiry.count({ where: { createdAt: { gte: today } } }),
    db.newsletterSubscriber.count({ where: { status: "active" } }),
    db.roomInventory.findMany(),
    db.roomBlock.count({
      where: { endDate: { gte: today } },
    }),
    db.siteVisitDay.findUnique({ where: { day: today } }),
    db.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        roomName: true,
        status: true,
        source: true,
        totalAmount: true,
        createdAt: true,
      },
    }),
  ]);

  const content = await getContent();
  const roomSlugs = content.rooms.map((r) => r.slug?.trim() || r.id);
  let totalPhysical = 0;
  for (const slug of roomSlugs) {
    const inv = inventory.find((i) => i.roomSlug === slug);
    totalPhysical += inv?.totalRooms ?? 1;
  }

  const activeStay = await db.booking.aggregate({
    _sum: { roomQuantity: true },
    where: {
      status: { in: ["confirmed", "checked_in"] },
      checkIn: { lte: today },
      checkOut: { gt: today },
    },
  });
  const occupied = activeStay._sum.roomQuantity ?? 0;
  const occupancy =
    totalPhysical > 0 ? Math.round((occupied / totalPhysical) * 100) : 0;

  return NextResponse.json({
    success: true,
    stats: {
      todaysBookings,
      pendingBooking: pending,
      confirmedBooking: confirmed,
      cancelledBooking: cancelled,
      offlineBooking: offline,
      onlineBooking: online,
      todaysRevenue: todayRevenueAgg._sum.totalAmount ?? 0,
      monthlyRevenue: monthRevenueAgg._sum.totalAmount ?? 0,
      roomOccupancy: occupancy,
      availableRooms: Math.max(0, totalPhysical - occupied),
      blockedRooms: blocks,
      pendingPayments: unpaid,
      paidPayments: paid,
      websiteVisitors: visitToday?.count ?? 0,
      todaysInquiries: contactToday + diningToday + spaToday + meetingsToday,
      restaurantBookings: diningToday,
      spaBookings: spaToday,
      meetingBookings: meetingsToday,
      newsletterSubscribers: newsletter,
    },
    recent: recentBookings,
  });
}
