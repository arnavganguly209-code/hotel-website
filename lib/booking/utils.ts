import { routes, roomDetailPath } from "@/lib/navigation";
import type { SiteContent } from "@/lib/cms/types";
import type { BookingSearchParams } from "./types";
import {
  calculateExtraGuestBreakdown,
  getRoomOccupancyPolicy,
  roomFitsOccupancy,
} from "./occupancy";

export function parseMaxGuests(guestsLabel: string): number {
  const match = guestsLabel.match(/\d+/g);
  if (!match?.length) return 2;
  return Math.max(...match.map(Number));
}

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

export function bookingDatesAreValid(checkIn: string, checkOut: string): boolean {
  if (!checkIn || !checkOut) return false;
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    Number.isFinite(start.getTime()) &&
    Number.isFinite(end.getTime()) &&
    start >= today &&
    end > start
  );
}

export function roomPublicSlug(room: SiteContent["rooms"][number]): string {
  return room.slug?.trim() || room.id;
}

/** Nightly rate always includes breakfast. */
export function breakfastIncludedNightlyPrice(room: SiteContent["rooms"][number]): number {
  return Math.max(0, Math.round(Number(room.price) || 0));
}

/** @deprecated Use breakfastIncludedNightlyPrice — breakfast is always included. */
export function roomOnlyNightlyPrice(room: SiteContent["rooms"][number]): number {
  return breakfastIncludedNightlyPrice(room);
}

export function calculateBookingTotal(options: {
  room: SiteContent["rooms"][number];
  nights: number;
  roomQuantity: number;
  breakfast?: "with-breakfast" | string;
  adults?: number;
  children?: number;
}): number {
  const adults = Math.max(1, Number(options.adults) || 1);
  const children = Math.max(0, Number(options.children) || 0);
  const breakdown = calculateExtraGuestBreakdown({
    room: options.room,
    adults,
    children,
    nights: options.nights,
    roomQuantity: options.roomQuantity,
  });
  return breakdown.grandTotal;
}

export { calculateExtraGuestBreakdown, getRoomOccupancyPolicy, roomFitsOccupancy };
export type { ExtraGuestBreakdown, RoomOccupancyPolicy } from "./occupancy";

export function bookingSearchFromParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): BookingSearchParams {
  const get = (key: string) => {
    const value = params instanceof URLSearchParams ? params.get(key) : params[key];
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  };
  return {
    checkIn: get("checkIn"),
    checkOut: get("checkOut"),
    guests: get("guests") || "2",
    children: get("children") || "0",
    rooms: get("rooms") || get("room") || "1",
    breakfast: "with-breakfast",
    promoCode: get("promoCode") || get("promo") || "",
  };
}

function withPromo(params: URLSearchParams, promoCode?: string) {
  const code = (promoCode || "").trim();
  if (code) params.set("promoCode", code);
  return params;
}

export function buildAvailabilityUrl(search: BookingSearchParams): string {
  const params = withPromo(
    new URLSearchParams({
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      guests: search.guests,
      children: search.children,
      rooms: search.rooms,
      breakfast: "with-breakfast",
    }),
    search.promoCode
  );
  return `${routes.rooms}?${params.toString()}`;
}

export function buildRoomDetailUrl(slug: string, search: BookingSearchParams): string {
  const params = withPromo(
    new URLSearchParams({
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      guests: search.guests,
      children: search.children,
      rooms: search.rooms,
      breakfast: "with-breakfast",
    }),
    search.promoCode
  );
  return `${roomDetailPath(slug)}?${params.toString()}`;
}

export function buildBookUrl(slug: string, search: BookingSearchParams): string {
  const params = withPromo(
    new URLSearchParams({
      room: slug,
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      guests: search.guests,
      children: search.children,
      rooms: search.rooms,
      breakfast: "with-breakfast",
    }),
    search.promoCode
  );
  return `${routes.book}?${params.toString()}`;
}

export function formatBookingDate(value: string): string {
  if (!value) return "—";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Room remains visible when within Orbit max occupancy.
 * Extra guests within max are allowed and priced — never hidden for allowed extras.
 */
export function isRoomAvailableForSearch(
  room: SiteContent["rooms"][number],
  search: BookingSearchParams
): boolean {
  if (room.available === false) return false;
  if ((search.checkIn || search.checkOut) && !bookingDatesAreValid(search.checkIn, search.checkOut)) {
    return false;
  }
  const adults = Math.max(1, Number(search.guests) || 1);
  const children = Math.max(0, Number(search.children) || 0);
  const roomCount = Math.max(1, Number(search.rooms) || 1);
  return roomFitsOccupancy(room, adults, children, roomCount);
}
