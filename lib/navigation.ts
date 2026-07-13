export const routes = {
  home: "/",
  about: "/about",
  rooms: "/rooms",
  availability: "/rooms/availability",
  book: "/book",
  dining: "/dining",
  spa: "/spa",
  gallery: "/gallery",
  culturalExperience: "/cultural-experience",
  contact: "/contact",
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
  orbit: "/orbit",
} as const;

export function roomDetailPath(id: string) {
  return `/rooms/${id}`;
}

export const DRAWER_NAV_ITEMS = [
  { label: "Overview", href: routes.home },
  { label: "Rooms", href: routes.rooms },
  { label: "Dining", href: routes.dining },
  { label: "Spa & Wellness", href: routes.spa },
  { label: "Gallery", href: routes.gallery },
  { label: "About", href: routes.about },
  { label: "Contact", href: routes.contact },
] as const;

/** @deprecated Use DRAWER_NAV_ITEMS */
export const NAV_ITEMS = DRAWER_NAV_ITEMS;
/** @deprecated Drawer is the sole navigation surface */
export const OVERLAY_NAV_ITEMS = [] as const;

export const FOOTER_NAV = {
  explore: [
    { label: "Overview", href: routes.home },
    { label: "Rooms", href: routes.rooms },
    { label: "Dining", href: routes.dining },
    { label: "Spa & Wellness", href: routes.spa },
    { label: "Gallery", href: routes.gallery },
    { label: "About", href: routes.about },
    { label: "Contact", href: routes.contact },
  ],
  experiences: [
    { label: "Reservations", href: routes.contact },
    { label: "Wellness", href: routes.spa },
  ],
  policies: [
    { label: "Privacy Policy", href: routes.privacy },
    { label: "Terms & Conditions", href: routes.terms },
  ],
} as const;

export const GALLERY_CATEGORIES = [
  "All",
  "Rooms",
  "Hotel",
  "Spa",
  "Restaurant",
  "Events",
] as const;
