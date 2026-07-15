import type { SiteContent } from "./types";
import { parseMaxGuests } from "@/lib/booking/utils";

export const DEFAULT_ROOM_POLICIES = [
  "Check-in from 2:00 PM · Check-out by 12:00 PM",
  "Non-smoking rooms throughout the property",
  "Valid photo identification required at check-in",
  "Cancellation policy applies — contact reservations for details",
];

type Room = SiteContent["rooms"][number];

export function enrichRoom(defaults: Room, partial: Partial<Room>): Room {
  const merged: Room = {
    ...defaults,
    ...partial,
    size: partial.size ?? defaults.size,
    bedType: partial.bedType ?? defaults.bedType,
    features: partial.features?.length ? partial.features : defaults.features,
  };

  return {
    ...merged,
    maxGuests: partial.maxGuests ?? defaults.maxGuests ?? parseMaxGuests(merged.guests),
    available: partial.available ?? defaults.available ?? true,
    visible: partial.visible !== undefined ? partial.visible : defaults.visible !== false,
    order: typeof partial.order === "number" ? partial.order : (defaults.order ?? 0),
    exploreText: partial.exploreText ?? defaults.exploreText ?? "Explore Room",
    breakfastPrice: partial.breakfastPrice ?? defaults.breakfastPrice ?? 15,
    longDescription:
      partial.longDescription ?? defaults.longDescription ?? `${merged.description} Thoughtfully appointed with premium linens, refined furnishings, and the attentive service that defines Hotel Thamel Park.`,
    gallery:
      partial.gallery?.length
        ? partial.gallery
        : defaults.gallery?.length
          ? defaults.gallery
          : [merged.imageSrc],
    amenities:
      partial.amenities?.length
        ? partial.amenities
        : defaults.amenities?.length
          ? defaults.amenities
          : merged.features,
    policies:
      partial.policies?.length
        ? partial.policies
        : defaults.policies?.length
          ? defaults.policies
          : DEFAULT_ROOM_POLICIES,
  };
}
