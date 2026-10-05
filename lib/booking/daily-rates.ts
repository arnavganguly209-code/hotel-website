import type { RoomRecord } from "./occupancy";
import { getRoomOccupancyPolicy } from "./occupancy";
import { DEFAULT_CURRENCY, DEFAULT_VAT_RATE, splitVatInclusive } from "./vat";

/** VAT-inclusive occupancy rates for one night, one room. */
export type OccupancyNightRate = {
  adult1: number;
  adult2: number;
  adult3: number;
  includedChildren: number;
  extraChildPrice: number;
};

export type OccupancyRatePatch = Partial<OccupancyNightRate>;

function money(value: unknown, fallback = 0): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.round(n);
}

function intOr(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.trunc(n);
}

export function parseOccupancyNightRate(
  raw: unknown,
  fallback?: OccupancyNightRate
): OccupancyNightRate | null {
  if (!raw || typeof raw !== "object") return fallback ?? null;
  const obj = raw as Record<string, unknown>;
  const base = fallback || {
    adult1: 0,
    adult2: 0,
    adult3: 0,
    includedChildren: 0,
    extraChildPrice: 0,
  };
  const adult1 = money(obj.adult1 ?? obj.rate1, base.adult1);
  const adult2 = money(obj.adult2 ?? obj.rate2, base.adult2);
  const adult3 = money(obj.adult3 ?? obj.rate3, base.adult3);
  return {
    adult1,
    adult2,
    adult3,
    includedChildren: intOr(obj.includedChildren ?? obj.childrenIncluded, base.includedChildren),
    extraChildPrice: money(obj.extraChildPrice, base.extraChildPrice),
  };
}

export function parseDailyRatesMap(raw: unknown): Record<string, OccupancyNightRate> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, OccupancyNightRate> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) continue;
    const parsed = parseOccupancyNightRate(v);
    if (parsed) out[k] = parsed;
  }
  return out;
}

/** CMS room price as Agoda-style occupancy defaults (2 adults included in base). */
export function defaultOccupancyRateFromRoom(room: RoomRecord): OccupancyNightRate {
  const policy = getRoomOccupancyPolicy(room);
  const base = Math.max(0, Math.round(Number(room.price) || 0));
  const adult3 =
    policy.maxAdults >= 3
      ? Math.max(0, base + Math.max(0, policy.extraAdultPrice))
      : base;
  return {
    adult1: base,
    adult2: base,
    adult3,
    includedChildren: policy.baseChildren,
    extraChildPrice: policy.extraChildPrice,
  };
}

export function occupancyAdultsPerRoom(adults: number, rooms: number): 1 | 2 | 3 {
  const per = Math.ceil(Math.max(1, Math.trunc(adults) || 1) / Math.max(1, Math.trunc(rooms) || 1));
  if (per <= 1) return 1;
  if (per === 2) return 2;
  return 3;
}

export function nightlyRateForOccupancy(rate: OccupancyNightRate, occ: 1 | 2 | 3): number {
  if (occ === 1) return Math.max(0, rate.adult1);
  if (occ === 2) return Math.max(0, rate.adult2 || rate.adult1);
  return Math.max(0, rate.adult3 || rate.adult2 || rate.adult1);
}

export function resolveNightRate(
  date: string,
  daily: Record<string, OccupancyNightRate>,
  defaults: OccupancyNightRate
): OccupancyNightRate {
  const day = daily[date];
  if (!day) return defaults;
  return {
    adult1: day.adult1 > 0 ? day.adult1 : defaults.adult1,
    adult2: day.adult2 > 0 ? day.adult2 : defaults.adult2,
    adult3: day.adult3 > 0 ? day.adult3 : defaults.adult3,
    includedChildren: day.includedChildren >= 0 ? day.includedChildren : defaults.includedChildren,
    extraChildPrice: day.extraChildPrice >= 0 ? day.extraChildPrice : defaults.extraChildPrice,
  };
}

export function quoteOccupancyStay(options: {
  nights: string[];
  adults: number;
  children: number;
  roomQuantity: number;
  daily: Record<string, OccupancyNightRate>;
  defaults: OccupancyNightRate;
}) {
  const rooms = Math.max(1, Math.trunc(options.roomQuantity) || 1);
  const adults = Math.max(1, Math.trunc(options.adults) || 1);
  const children = Math.max(0, Math.trunc(options.children) || 0);
  const nights = options.nights.length > 0 ? options.nights : [];
  const occ = occupancyAdultsPerRoom(adults, rooms);

  let roomSubtotal = 0;
  let extrasTotal = 0;
  let includedChildren = 0;
  let extraChildPrice = 0;
  let extraChildren = 0;

  for (const date of nights) {
    const rate = resolveNightRate(date, options.daily, options.defaults);
    roomSubtotal += nightlyRateForOccupancy(rate, occ) * rooms;
    const included = rate.includedChildren * rooms;
    includedChildren = rate.includedChildren;
    extraChildPrice = rate.extraChildPrice;
    extraChildren = Math.max(0, children - included);
    extrasTotal += extraChildren * rate.extraChildPrice;
  }

  const nightCount = Math.max(1, nights.length);
  const grandTotal = roomSubtotal + extrasTotal;
  const baseNightly = nights.length
    ? Math.round(roomSubtotal / (nights.length * rooms))
    : nightlyRateForOccupancy(options.defaults, occ);

  return {
    occupancy: occ,
    nights: nightCount,
    roomQuantity: rooms,
    extraAdults: Math.max(0, occ - 2),
    extraChildren,
    extraChildPrice,
    includedChildren,
    perNight: extrasTotal > 0 && nights.length ? Math.round(extrasTotal / nights.length) : 0,
    total: extrasTotal,
    baseNightly,
    roomSubtotal,
    grandTotal,
    vat: splitVatInclusive(grandTotal, DEFAULT_VAT_RATE, DEFAULT_CURRENCY),
  };
}

export function occupancyRateLabel(occ: 1 | 2 | 3): string {
  return occ === 1 ? "1 adult" : `${occ} adults`;
}
