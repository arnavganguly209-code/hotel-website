import { db, isDatabaseAvailable } from "@/lib/db";

const ACTIVE_STATUSES = [
  "pending",
  "confirmed",
  "checked_in",
  "payment_pending",
] as const;

/** Unit statuses that remove a physical room from sellable stock. */
export const NON_SELLABLE_UNIT_STATUSES = new Set(["maintenance", "unavailable"]);

export type InventoryOverrides = {
  /** YYYY-MM → max rooms sellable any night that month */
  monthly?: Record<string, number>;
  /** YYYY-MM-DD → max rooms sellable that night */
  daily?: Record<string, number>;
};

export function parseInventoryOverrides(raw: unknown): InventoryOverrides {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const monthly: Record<string, number> = {};
  const daily: Record<string, number> = {};

  const monthlySrc =
    obj.monthly && typeof obj.monthly === "object"
      ? (obj.monthly as Record<string, unknown>)
      : {};
  const dailySrc =
    obj.daily && typeof obj.daily === "object"
      ? (obj.daily as Record<string, unknown>)
      : {};

  for (const [k, v] of Object.entries(monthlySrc)) {
    const n = Number(v);
    if (/^\d{4}-\d{2}$/.test(k) && Number.isFinite(n) && n >= 0) {
      monthly[k] = Math.floor(n);
    }
  }
  for (const [k, v] of Object.entries(dailySrc)) {
    const n = Number(v);
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && Number.isFinite(n) && n >= 0) {
      daily[k] = Math.floor(n);
    }
  }
  return { monthly, daily };
}

function dayStart(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const d = dayStart(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDay(d);
}

/** Each night in [checkIn, checkOut). */
export function nightsInStay(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  let cursor = checkIn;
  let guard = 0;
  while (cursor < checkOut && guard < 366) {
    nights.push(cursor);
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return nights;
}

/** Physical sellable rooms for a category (excludes maintenance + unavailable units). */
export async function getSellableTotal(
  roomSlug: string,
  fallback = 1
): Promise<number> {
  if (!isDatabaseAvailable()) return fallback;

  const units = await db.roomUnit.findMany({
    where: { roomSlug },
    select: { status: true },
  });

  if (units.length > 0) {
    return units.filter((u) => !NON_SELLABLE_UNIT_STATUSES.has(u.status)).length;
  }

  const row = await db.roomInventory.findUnique({ where: { roomSlug } });
  return row?.totalRooms ?? fallback;
}

/** @deprecated use getSellableTotal — kept for callers expecting old name */
export async function getInventoryTotal(
  roomSlug: string,
  fallback = 1
): Promise<number> {
  return getSellableTotal(roomSlug, fallback);
}

export async function getInventoryOverrides(
  roomSlug: string
): Promise<InventoryOverrides> {
  if (!isDatabaseAvailable()) return {};
  const row = await db.roomInventory.findUnique({ where: { roomSlug } });
  return parseInventoryOverrides(row?.overrides);
}

/** Cap for one night after monthly/daily admin overrides.
 * Daily override is authoritative (Expedia-style allotment for that date).
 * Monthly cap applies only when no daily allotment is set.
 */
export function cappedCapacityForNight(
  baseSellable: number,
  nightIso: string,
  overrides: InventoryOverrides
): number {
  if (overrides.daily && overrides.daily[nightIso] != null) {
    return Math.max(0, Math.floor(overrides.daily[nightIso]));
  }
  let cap = Math.max(0, baseSellable);
  const monthKey = nightIso.slice(0, 7);
  if (overrides.monthly && overrides.monthly[monthKey] != null) {
    cap = Math.min(cap, overrides.monthly[monthKey]);
  }
  return Math.max(0, cap);
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

/** Rooms sold on a single night (active bookings covering that night). */
export async function countOccupiedOnNight(
  roomSlug: string,
  nightIso: string
): Promise<number> {
  if (!isDatabaseAvailable()) return 0;
  const night = dayStart(nightIso);
  const next = dayStart(addDays(nightIso, 1));

  const bookings = await db.booking.findMany({
    where: {
      roomSlug,
      status: { in: [...ACTIVE_STATUSES] },
      checkIn: { lt: next },
      checkOut: { gt: night },
    },
    select: { roomQuantity: true },
  });

  return bookings.reduce((sum, b) => sum + Math.max(1, b.roomQuantity || 1), 0);
}

/** Max concurrent occupied rooms across the stay (legacy helper). */
export async function countOccupiedRooms(
  roomSlug: string,
  checkIn: string,
  checkOut: string
): Promise<number> {
  const nights = nightsInStay(checkIn, checkOut);
  if (nights.length === 0) return 0;
  let max = 0;
  for (const night of nights) {
    max = Math.max(max, await countOccupiedOnNight(roomSlug, night));
  }
  return max;
}

export type AvailabilityResult = {
  total: number;
  occupied: number;
  blocked: boolean;
  available: number;
  /** Tightest nightly cap after overrides (before bookings). */
  cappedTotal: number;
};

/**
 * Sellable rooms for a stay = min over nights of (nightCap − occupiedThatNight).
 * Blocks close the whole category for overlapping ranges.
 */
export async function getAvailableCount(options: {
  roomSlug: string;
  checkIn: string;
  checkOut: string;
  fallbackTotal?: number;
}): Promise<AvailabilityResult> {
  const baseTotal = await getSellableTotal(
    options.roomSlug,
    options.fallbackTotal ?? 1
  );
  const overrides = await getInventoryOverrides(options.roomSlug);
  const blocked = await isDateRangeBlocked(
    options.roomSlug,
    options.checkIn,
    options.checkOut
  );

  if (blocked) {
    return {
      total: baseTotal,
      occupied: baseTotal,
      blocked: true,
      available: 0,
      cappedTotal: 0,
    };
  }

  const nights = nightsInStay(options.checkIn, options.checkOut);
  if (nights.length === 0) {
    return {
      total: baseTotal,
      occupied: 0,
      blocked: false,
      available: 0,
      cappedTotal: 0,
    };
  }

  let minAvailable = Number.POSITIVE_INFINITY;
  let maxOccupied = 0;
  let minCap = Number.POSITIVE_INFINITY;

  for (const night of nights) {
    const cap = cappedCapacityForNight(baseTotal, night, overrides);
    const occupied = await countOccupiedOnNight(options.roomSlug, night);
    minCap = Math.min(minCap, cap);
    maxOccupied = Math.max(maxOccupied, occupied);
    minAvailable = Math.min(minAvailable, Math.max(0, cap - occupied));
  }

  return {
    total: baseTotal,
    occupied: maxOccupied,
    blocked: false,
    available: Number.isFinite(minAvailable) ? minAvailable : 0,
    cappedTotal: Number.isFinite(minCap) ? minCap : 0,
  };
}

export async function assertBookingAvailability(options: {
  roomSlug: string;
  checkIn: string;
  checkOut: string;
  roomQuantity: number;
  fallbackTotal?: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const qty = Math.max(1, options.roomQuantity || 1);
  const result = await getAvailableCount(options);

  if (result.blocked) {
    return {
      ok: false,
      error: `Selected dates are not available for this room (${options.checkIn} – ${options.checkOut}).`,
    };
  }

  if (result.available < qty) {
    if (result.available <= 0) {
      return {
        ok: false,
        error: `No rooms available for ${options.checkIn} – ${options.checkOut}. Please choose other dates.`,
      };
    }
    return {
      ok: false,
      error: `Only ${result.available} room(s) available for the selected dates. You requested ${qty}.`,
    };
  }

  return { ok: true };
}

/** Sum Available Today across categories (dashboard). Uses hotel local calendar day. */
export async function sumAvailableToday(
  roomSlugs: string[]
): Promise<{ available: number; total: number; occupied: number }> {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const checkIn = `${y}-${m}-${d}`;
  const checkOut = addDays(checkIn, 1);

  let available = 0;
  let total = 0;
  let occupied = 0;

  for (const slug of roomSlugs) {
    if (!slug) continue;
    const row = await getAvailableCount({
      roomSlug: slug,
      checkIn,
      checkOut,
    });
    available += row.available;
    total += row.cappedTotal || row.total;
    occupied += row.occupied;
  }

  return { available, total, occupied };
}

export type CalendarDayStock = {
  date: string;
  sellableBase: number;
  cap: number;
  booked: number;
  available: number;
  blocked: boolean;
  hasDailyCap: boolean;
  hasMonthlyCap: boolean;
};

/** Month grid for admin: booked vs free online stock per night. */
export async function getMonthCalendarStock(options: {
  roomSlug: string;
  year: number;
  month: number; // 1-12
}): Promise<{
  roomSlug: string;
  year: number;
  month: number;
  monthKey: string;
  sellableBase: number;
  monthlyCap: number | null;
  days: CalendarDayStock[];
}> {
  const { roomSlug, year, month } = options;
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const sellableBase = await getSellableTotal(roomSlug, 1);
  const overrides = await getInventoryOverrides(roomSlug);
  const monthlyCap =
    overrides.monthly && overrides.monthly[monthKey] != null
      ? overrides.monthly[monthKey]
      : null;

  const daysInMonth = new Date(year, month, 0).getDate();
  const rangeStart = `${monthKey}-01`;
  const rangeEnd = addDays(
    `${monthKey}-${String(daysInMonth).padStart(2, "0")}`,
    1
  );

  const start = dayStart(rangeStart);
  const end = dayStart(rangeEnd);

  const [bookings, blocks] = await Promise.all([
    isDatabaseAvailable()
      ? db.booking.findMany({
          where: {
            roomSlug,
            status: { in: [...ACTIVE_STATUSES] },
            checkIn: { lt: end },
            checkOut: { gt: start },
          },
          select: { checkIn: true, checkOut: true, roomQuantity: true },
        })
      : Promise.resolve([]),
    isDatabaseAvailable()
      ? db.roomBlock.findMany({
          where: {
            roomSlug,
            startDate: { lt: end },
            endDate: { gt: start },
          },
          select: { startDate: true, endDate: true },
        })
      : Promise.resolve([]),
  ]);

  const days: CalendarDayStock[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${monthKey}-${String(day).padStart(2, "0")}`;
    const night = dayStart(date);
    const next = dayStart(addDays(date, 1));

    const blocked = blocks.some((b) => b.startDate < next && b.endDate > night);
    const booked = bookings.reduce((sum, b) => {
      if (b.checkIn < next && b.checkOut > night) {
        return sum + Math.max(1, b.roomQuantity || 1);
      }
      return sum;
    }, 0);

    const hasDailyCap = Boolean(overrides.daily && overrides.daily[date] != null);
    const hasMonthlyCap = monthlyCap != null;
    const cap = blocked ? 0 : cappedCapacityForNight(sellableBase, date, overrides);
    const available = blocked ? 0 : Math.max(0, cap - booked);

    days.push({
      date,
      sellableBase,
      cap,
      booked,
      available,
      blocked,
      hasDailyCap,
      hasMonthlyCap,
    });
  }

  return {
    roomSlug,
    year,
    month,
    monthKey,
    sellableBase,
    monthlyCap,
    days,
  };
}

export type ManageDayCell = {
  date: string;
  inventory: number;
  booked: number;
  available: number;
  open: boolean;
  blocked: boolean;
  hasDailyCap: boolean;
};

export type ManageRoomRow = {
  roomSlug: string;
  roomName: string;
  sellableBase: number;
  days: ManageDayCell[];
};

/** Horizontal date-range stock for multiple categories (Inventory Manage). */
export async function getInventoryManageGrid(options: {
  roomSlugs: { slug: string; name: string }[];
  startDate: string;
  endDateInclusive: string;
}): Promise<{ dates: string[]; rooms: ManageRoomRow[] }> {
  const dates = nightsInStay(options.startDate, addDays(options.endDateInclusive, 1));
  if (dates.length === 0) {
    return { dates: [], rooms: [] };
  }

  const rangeStart = dates[0];
  const rangeEnd = addDays(dates[dates.length - 1], 1);
  const start = dayStart(rangeStart);
  const end = dayStart(rangeEnd);

  const rooms: ManageRoomRow[] = [];

  for (const { slug, name } of options.roomSlugs) {
    const sellableBase = await getSellableTotal(slug, 1);
    const overrides = await getInventoryOverrides(slug);

    const [bookings, blocks] = await Promise.all([
      isDatabaseAvailable()
        ? db.booking.findMany({
            where: {
              roomSlug: slug,
              status: { in: [...ACTIVE_STATUSES] },
              checkIn: { lt: end },
              checkOut: { gt: start },
            },
            select: { checkIn: true, checkOut: true, roomQuantity: true },
          })
        : Promise.resolve([]),
      isDatabaseAvailable()
        ? db.roomBlock.findMany({
            where: {
              roomSlug: slug,
              startDate: { lt: end },
              endDate: { gt: start },
            },
            select: { startDate: true, endDate: true },
          })
        : Promise.resolve([]),
    ]);

    const days: ManageDayCell[] = dates.map((date) => {
      const night = dayStart(date);
      const next = dayStart(addDays(date, 1));
      const blocked = blocks.some((b) => b.startDate < next && b.endDate > night);
      const booked = bookings.reduce((sum, b) => {
        if (b.checkIn < next && b.checkOut > night) {
          return sum + Math.max(1, b.roomQuantity || 1);
        }
        return sum;
      }, 0);
      const hasDailyCap = Boolean(overrides.daily && overrides.daily[date] != null);
      const inventory = blocked ? 0 : cappedCapacityForNight(sellableBase, date, overrides);
      const available = blocked ? 0 : Math.max(0, inventory - booked);
      const open = !blocked && inventory > 0;
      return {
        date,
        inventory,
        booked,
        available,
        open,
        blocked,
        hasDailyCap,
      };
    });

    rooms.push({ roomSlug: slug, roomName: name, sellableBase, days });
  }

  return { dates, rooms };
}

/** Merge daily allotments into RoomInventory.overrides (shared source of truth). */
export async function upsertDailyInventoryAllotments(options: {
  roomSlug: string;
  dates: string[];
  /** Absolute inventory for each date; use null to clear daily override (open to base). */
  inventory: number | null;
}): Promise<InventoryOverrides> {
  if (!isDatabaseAvailable()) return {};
  const roomSlug = options.roomSlug.trim();
  const existing = await db.roomInventory.findUnique({ where: { roomSlug } });
  const prev = parseInventoryOverrides(existing?.overrides);
  const daily = { ...(prev.daily || {}) };

  for (const date of options.dates) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (options.inventory == null) {
      delete daily[date];
    } else {
      daily[date] = Math.max(0, Math.floor(options.inventory));
    }
  }

  const overrides: InventoryOverrides = {
    monthly: prev.monthly || {},
    daily,
  };

  await db.roomInventory.upsert({
    where: { roomSlug },
    create: {
      roomSlug,
      totalRooms: existing?.totalRooms ?? 1,
      overrides,
    },
    update: { overrides },
  });

  return overrides;
}

/** Copy one date's daily allotment (or computed inventory) onto a target range. */
export async function copyDailyInventory(options: {
  roomSlug: string;
  sourceDate: string;
  targetDates: string[];
}): Promise<InventoryOverrides> {
  const sellableBase = await getSellableTotal(options.roomSlug, 1);
  const overrides = await getInventoryOverrides(options.roomSlug);
  const sourceInv = cappedCapacityForNight(
    sellableBase,
    options.sourceDate,
    overrides
  );
  return upsertDailyInventoryAllotments({
    roomSlug: options.roomSlug,
    dates: options.targetDates,
    inventory: sourceInv,
  });
}
