import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getAdminSessionUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const paymentStatus = searchParams.get("paymentStatus")?.trim();
  const q = searchParams.get("q")?.trim().toLowerCase();

  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      roomName: true,
      source: true,
      paymentMethod: true,
      paymentStatus: true,
      status: true,
      totalAmount: true,
      transactionId: true,
      cardLast4: true,
      checkIn: true,
      checkOut: true,
      createdAt: true,
    },
  });

  const filtered = bookings.filter((b) => {
    if (paymentStatus && paymentStatus !== "all" && b.paymentStatus !== paymentStatus) return false;
    if (q) {
      const hay = `${b.name} ${b.email} ${b.roomName}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const totals = {
    paid: filtered
      .filter((b) => ["paid", "offline"].includes(b.paymentStatus))
      .reduce((sum, b) => sum + b.totalAmount, 0),
    unpaid: filtered
      .filter((b) => ["unpaid", "pending"].includes(b.paymentStatus))
      .reduce((sum, b) => sum + b.totalAmount, 0),
    refunded: filtered
      .filter((b) => b.paymentStatus === "refunded")
      .reduce((sum, b) => sum + b.totalAmount, 0),
  };

  return NextResponse.json({ success: true, bookings: filtered, totals });
}
