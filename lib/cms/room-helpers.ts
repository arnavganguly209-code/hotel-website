import type { SiteContent } from "./types";
import { parseMaxGuests } from "@/lib/booking/utils";

export const DEFAULT_ROOM_POLICIES = [
  "Check-in from 2:00 PM · Check-out by 12:00 PM",
  "Non-smoking rooms throughout the property",
  "Valid photo identification required at check-in",
  "Cancellation policy applies — contact reservations for details",
];

const DEFAULT_ROOM_FACILITIES = [
  "Complimentary high-speed Wi-Fi",
  "Daily housekeeping",
  "Climate control",
  "En-suite bathroom",
  "In-room safe",
  "24-hour front desk assistance",
];

const DEFAULT_ROOM_SERVICES = [
  "Breakfast service",
  "Airport transfer on request",
  "Laundry and pressing service",
  "Luggage assistance",
  "Wake-up service",
  "Concierge recommendations",
];

const DEFAULT_NEARBY_ATTRACTIONS = [
  "Garden of Dreams · 6 min walk",
  "Kathmandu Durbar Square · 12 min drive",
  "Swayambhunath Stupa · 18 min drive",
  "Narayanhiti Palace Museum · 10 min walk",
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
    slug: partial.slug?.trim() || defaults.slug || merged.id,
    maxGuests: partial.maxGuests ?? defaults.maxGuests ?? parseMaxGuests(merged.guests),
    available: partial.available ?? defaults.available ?? true,
    visible: partial.visible !== undefined ? partial.visible : defaults.visible !== false,
    order: typeof partial.order === "number" ? partial.order : (defaults.order ?? 0),
    exploreText: partial.exploreText ?? defaults.exploreText ?? "Explore Room",
    breakfastPrice:
      partial.breakfastPrice === 15
        ? 5
        : (partial.breakfastPrice ?? defaults.breakfastPrice ?? 5),
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
    facilities:
      partial.facilities?.length
        ? partial.facilities
        : defaults.facilities?.length
          ? defaults.facilities
          : DEFAULT_ROOM_FACILITIES,
    services:
      partial.services?.length
        ? partial.services
        : defaults.services?.length
          ? defaults.services
          : DEFAULT_ROOM_SERVICES,
    nearbyAttractions:
      partial.nearbyAttractions?.length
        ? partial.nearbyAttractions
        : defaults.nearbyAttractions?.length
          ? defaults.nearbyAttractions
          : DEFAULT_NEARBY_ATTRACTIONS,
    checkInTime: partial.checkInTime ?? defaults.checkInTime ?? "2:00 PM",
    checkOutTime: partial.checkOutTime ?? defaults.checkOutTime ?? "12:00 PM",
    cancellationLabel:
      partial.cancellationLabel ?? defaults.cancellationLabel ?? "Flexible cancellation",
    seo: {
      metaTitle:
        partial.seo?.metaTitle ||
        defaults.seo?.metaTitle ||
        `${merged.name} | Hotel Thamel Park`,
      metaDescription:
        partial.seo?.metaDescription ||
        defaults.seo?.metaDescription ||
        merged.description,
      canonical:
        partial.seo?.canonical ||
        defaults.seo?.canonical ||
        `/rooms/${partial.slug?.trim() || defaults.slug || merged.id}`,
      ogImage:
        partial.seo?.ogImage ||
        defaults.seo?.ogImage ||
        merged.imageSrc,
      twitterImage:
        partial.seo?.twitterImage ||
        defaults.seo?.twitterImage ||
        merged.imageSrc,
      altText:
        partial.seo?.altText ||
        defaults.seo?.altText ||
        `${merged.name} at Hotel Thamel Park`,
    },
  };
}
