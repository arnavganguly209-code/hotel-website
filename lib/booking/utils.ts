import { routes, roomDetailPath } from "@/lib/navigation";
import type { SiteContent } from "@/lib/cms/types";
import type { BookingSearchParams } from "./types";

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

export function calculateBookingTotal(options: {
  room: SiteContent["rooms"][number];
  nights: number;
  roomQuantity: number;
  breakfast: "room-only" | "with-breakfast";
}): number {
  const { room, nights, roomQuantity, breakfast } = options;
  const base = room.price * nights * roomQuantity;
  const breakfastExtra =
    breakfast === "with-breakfast" ? (room.breakfastPrice ?? 15) * nights * roomQuantity : 0;
  return base + breakfastExtra;
}

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
  };
}

export function buildAvailabilityUrl(search: BookingSearchParams): string {
  const params = new URLSearchParams({
    checkIn: search.checkIn,
    checkOut: search.checkOut,
    guests: search.guests,
    children: search.children,
    rooms: search.rooms,
  });
  return `${routes.availability}?${params.toString()}`;
}

export function buildRoomDetailUrl(slug: string, search: BookingSearchParams): string {
  const params = new URLSearchParams({
    checkIn: search.checkIn,
    checkOut: search.checkOut,
    guests: search.guests,
    children: search.children,
    rooms: search.rooms,
  });
  return `${roomDetailPath(slug)}?${params.toString()}`;
}

export function buildBookUrl(slug: string, search: BookingSearchParams): string {
  const params = new URLSearchParams({
    room: slug,
    checkIn: search.checkIn,
    checkOut: search.checkOut,
    guests: search.guests,
    children: search.children,
    rooms: search.rooms,
  });
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

export function isRoomAvailableForSearch(
  room: SiteContent["rooms"][number],
  search: BookingSearchParams
): boolean {
  if (room.available === false) return false;
  const guestCount = Number(search.guests) || 1;
  const maxGuests = room.maxGuests ?? parseMaxGuests(room.guests);
  return guestCount <= maxGuests;
}
