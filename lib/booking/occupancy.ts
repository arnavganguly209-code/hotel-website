import type { SiteContent } from "@/lib/cms/types";

export type RoomRecord = SiteContent["rooms"][number];

export interface RoomOccupancyPolicy {
  baseAdults: number;
  baseChildren: number;
  maxAdults: number;
  maxChildren: number;
  /** Per extra adult, per night, per booking (after included base × rooms). */
  extraAdultPrice: number;
  /** Per extra child, per night, per booking (after included base × rooms). */
  extraChildPrice: number;
}

/** Seed policies by room id — used when Orbit fields are missing. */
export const DEFAULT_OCCUPANCY_BY_ROOM_ID: Record<string, RoomOccupancyPolicy> = {
  "super-deluxe-twin": {
    baseAdults: 2,
    baseChildren: 1,
    maxAdults: 3,
    maxChildren: 2,
    extraAdultPrice: 5,
    extraChildPrice: 5,
  },
  "super-deluxe": {
    baseAdults: 2,
    baseChildren: 1,
    maxAdults: 3,
    maxChildren: 2,
    extraAdultPrice: 5,
    extraChildPrice: 5,
  },
  "family-room": {
    baseAdults: 4,
    baseChildren: 2,
    maxAdults: 4,
    maxChildren: 2,
    extraAdultPrice: 0,
    extraChildPrice: 0,
  },
  "standard-deluxe": {
    baseAdults: 2,
    baseChildren: 1,
    maxAdults: 2,
    maxChildren: 2,
    extraAdultPrice: 0,
    extraChildPrice: 5,
  },
};

const GENERIC_DEFAULT: RoomOccupancyPolicy = {
  baseAdults: 2,
  baseChildren: 1,
  maxAdults: 2,
  maxChildren: 1,
  extraAdultPrice: 5,
  extraChildPrice: 5,
};

function positiveInt(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.trunc(n);
}

function money(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.round(n);
}

/** Resolve occupancy policy from Orbit room fields with safe defaults. */
export function getRoomOccupancyPolicy(room: RoomRecord): RoomOccupancyPolicy {
  const seed =
    DEFAULT_OCCUPANCY_BY_ROOM_ID[room.id] ||
    DEFAULT_OCCUPANCY_BY_ROOM_ID[room.slug || ""] ||
    GENERIC_DEFAULT;

  const baseAdults = positiveInt(room.baseAdults, seed.baseAdults);
  const baseChildren = positiveInt(room.baseChildren, seed.baseChildren);
  const maxAdults = Math.max(baseAdults, positiveInt(room.maxAdults, seed.maxAdults));
  const maxChildren = Math.max(baseChildren, positiveInt(room.maxChildren, seed.maxChildren));

  return {
    baseAdults,
    baseChildren,
    maxAdults,
    maxChildren,
    extraAdultPrice: money(room.extraAdultPrice, seed.extraAdultPrice),
    extraChildPrice: money(room.extraChildPrice, seed.extraChildPrice),
  };
}

export function roomFitsOccupancy(
  room: RoomRecord,
  adults: number,
  children: number,
  roomQuantity = 1
): boolean {
  const policy = getRoomOccupancyPolicy(room);
  const rooms = Math.max(1, Math.trunc(roomQuantity) || 1);
  const a = Math.max(0, Math.trunc(adults) || 0);
  const c = Math.max(0, Math.trunc(children) || 0);
  return a <= policy.maxAdults * rooms && c <= policy.maxChildren * rooms;
}

export interface ExtraGuestBreakdown {
  extraAdults: number;
  extraChildren: number;
  perNight: number;
  nights: number;
  total: number;
  baseNightly: number;
  roomSubtotal: number;
  grandTotal: number;
  policy: RoomOccupancyPolicy;
}

export function calculateExtraGuestBreakdown(options: {
  room: RoomRecord;
  adults: number;
  children: number;
  nights: number;
  roomQuantity: number;
}): ExtraGuestBreakdown {
  const policy = getRoomOccupancyPolicy(options.room);
  const rooms = Math.max(1, Math.trunc(options.roomQuantity) || 1);
  const nights = Math.max(1, Math.trunc(options.nights) || 1);
  const adults = Math.max(0, Math.trunc(options.adults) || 0);
  const children = Math.max(0, Math.trunc(options.children) || 0);

  const includedAdults = policy.baseAdults * rooms;
  const includedChildren = policy.baseChildren * rooms;
  const extraAdults = Math.max(0, adults - includedAdults);
  const extraChildren = Math.max(0, children - includedChildren);
  const perNight =
    extraAdults * policy.extraAdultPrice + extraChildren * policy.extraChildPrice;
  const baseNightly = Math.max(0, Math.round(Number(options.room.price) || 0));
  const roomSubtotal = baseNightly * nights * rooms;
  const extrasTotal = perNight * nights;

  return {
    extraAdults,
    extraChildren,
    perNight,
    nights,
    total: extrasTotal,
    baseNightly,
    roomSubtotal,
    grandTotal: roomSubtotal + extrasTotal,
    policy,
  };
}
