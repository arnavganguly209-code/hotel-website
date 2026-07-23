import { db, isDatabaseAvailable } from "@/lib/db";

const ACTIVE_STATUSES = new Set([
  "pending",
  "confirmed",
  "checked_in",
  "payment_pending",
]);

function dayStart(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Rooms occupied by active bookings overlapping [checkIn, checkOut). */
export async function countOccupiedRooms(
  roomSlug: string,
  checkIn: string,
  checkOut: string
): Promise<number> {
  if (!isDatabaseAvailable()) return 0;
  const start = dayStart(checkIn);
  const end = dayStart(checkOut);

  const bookings = await db.booking.findMany({
    where: {
      roomSlug,
      status: { in: Array.from(ACTIVE_STATUSES) },
      checkIn: { lt: end },
      checkOut: { gt: start },
    },
    select: { roomQuantity: true, checkIn: true, checkOut: true },
  });

  return bookings.reduce((sum, b) => {
    if (rangesOverlap(b.checkIn, b.checkOut, start, end)) {
      return sum + Math.max(1, b.roomQuantity || 1);
    }
    return sum;
  }, 0);
}

export async function isDateRangeBlocked(
  roomSlug: string,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  if (!isDatabaseAvailable()) return false;
  const start = dayStart(checkIn);
  const end = dayStart(checkOut);

  const blocks = await db.roomBlock.findMany({
    where: {
      roomSlug,
      startDate: { lt: end },
      endDate: { gt: start },
    },
    select: { id: true },
    take: 1,
  });
  return blocks.length > 0;
}

export async function getInventoryTotal(roomSlug: string, fallback = 1): Promise<number> {
  if (!isDatabaseAvailable()) return fallback;
  const unitCount = await db.roomUnit.count({ where: { roomSlug } });
  if (unitCount > 0) return unitCount;
  const row = await db.roomInventory.findUnique({ where: { roomSlug } });
  return row?.totalRooms ?? fallback;
}

export async function getAvailableCount(options: {
  roomSlug: string;
  checkIn: string;
  checkOut: string;
  fallbackTotal?: number;
}): Promise<{ total: number; occupied: number; blocked: boolean; available: number }> {
  const total = await getInventoryTotal(options.roomSlug, options.fallbackTotal ?? 1);
  const blocked = await isDateRangeBlocked(
    options.roomSlug,
    options.checkIn,
    options.checkOut
  );
  if (blocked) {
    return { total, occupied: total, blocked: true, available: 0 };
  }
  const occupied = await countOccupiedRooms(
    options.roomSlug,
    options.checkIn,
    options.checkOut
  );
  return {
    total,
    occupied,
    blocked: false,
    available: Math.max(0, total - occupied),
  };
}

export async function assertBookingAvailability(options: {
  roomSlug: string;
  checkIn: string;
  checkOut: string;
  roomQuantity: number;
  fallbackTotal?: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await getAvailableCount(options);
  if (result.blocked) {
    return { ok: false, error: "Selected dates are not available for this room." };
  }
  if (result.available < options.roomQuantity) {
    return {
      ok: false,
      error: "Not enough rooms available for the selected dates.",
    };
  }
  return { ok: true };
}
