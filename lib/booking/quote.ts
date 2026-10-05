import { getInventoryOverrides, nightsInStay } from "@/lib/admin/availability";
import {
  defaultOccupancyRateFromRoom,
  occupancyRateLabel,
  quoteOccupancyStay,
  type OccupancyNightRate,
} from "@/lib/booking/daily-rates";
import {
  calculateExtraGuestBreakdown,
  getRoomOccupancyPolicy,
  type ExtraGuestBreakdown,
  type RoomRecord,
} from "@/lib/booking/occupancy";

export type RoomStayQuote = ExtraGuestBreakdown & {
  occupancy: 1 | 2 | 3;
  occupancyLabel: string;
  includedChildren: number;
  extraChildPrice: number;
};

function occupancyFromAdults(adults: number, rooms: number): 1 | 2 | 3 {
  const per = Math.ceil(Math.max(1, adults) / Math.max(1, rooms));
  if (per <= 1) return 1;
  if (per === 2) return 2;
  return 3;
}

export async function quoteRoomStay(options: {
  room: RoomRecord;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomQuantity: number;
  roomSlug: string;
}): Promise<RoomStayQuote> {
  const nights = nightsInStay(options.checkIn, options.checkOut);
  const overrides = await getInventoryOverrides(options.roomSlug);
  const cmsDefaults = defaultOccupancyRateFromRoom(options.room);
  const defaults: OccupancyNightRate = overrides.rateDefaults
    ? {
        adult1: overrides.rateDefaults.adult1 || cmsDefaults.adult1,
        adult2: overrides.rateDefaults.adult2 || cmsDefaults.adult2,
        adult3: overrides.rateDefaults.adult3 || cmsDefaults.adult3,
        includedChildren:
          overrides.rateDefaults.includedChildren >= 0
            ? overrides.rateDefaults.includedChildren
            : cmsDefaults.includedChildren,
        extraChildPrice:
          overrides.rateDefaults.extraChildPrice >= 0
            ? overrides.rateDefaults.extraChildPrice
            : cmsDefaults.extraChildPrice,
      }
    : cmsDefaults;

  const quote = quoteOccupancyStay({
    nights: nights.length ? nights : [options.checkIn],
    adults: options.adults,
    children: options.children,
    roomQuantity: options.roomQuantity,
    daily: overrides.rates || {},
    defaults,
  });

  if (quote.grandTotal <= 0) {
    const fallback = calculateExtraGuestBreakdown({
      room: options.room,
      adults: options.adults,
      children: options.children,
      nights: Math.max(1, nights.length),
      roomQuantity: options.roomQuantity,
    });
    const occ = occupancyFromAdults(options.adults, options.roomQuantity);
    return {
      ...fallback,
      occupancy: occ,
      occupancyLabel: occupancyRateLabel(occ),
      includedChildren: fallback.policy.baseChildren,
      extraChildPrice: fallback.policy.extraChildPrice,
    };
  }

  const policy = getRoomOccupancyPolicy(options.room);
  return {
    extraAdults: quote.extraAdults,
    extraChildren: quote.extraChildren,
    perNight: quote.perNight,
    nights: quote.nights,
    total: quote.total,
    baseNightly: quote.baseNightly,
    roomSubtotal: quote.roomSubtotal,
    grandTotal: quote.grandTotal,
    vat: quote.vat,
    policy,
    occupancy: quote.occupancy,
    occupancyLabel: occupancyRateLabel(quote.occupancy),
    includedChildren: quote.includedChildren,
    extraChildPrice: quote.extraChildPrice,
  };
}
