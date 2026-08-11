export const routes = {
  home: "/",
  about: "/about",
  rooms: "/rooms",
  availability: "/rooms/availability",
  book: "/book",
  dining: "/dining",
  restaurant: "/dining",
  spa: "/spa",
  meetingsEvents: "/meetings-events",
  gallery: "/gallery",
  articles: "/articles",
  culturalExperience: "/cultural-experience",
  contact: "/contact",
  privacy: "/legal/privacy",
  terms: "/legal/terms",
  legal: "/legal",
  orbit: "/orbit",
} as const;

/** Public dining lives at /dining — rewrite legacy /restaurant links at render time. */
export function normalizePublicNavItem<T extends { label: string; href: string }>(item: T): T {
  const href =
    item.href === "/restaurant" || item.href.startsWith("/restaurant/")
      ? item.href.replace(/^\/restaurant/, "/dining")
      : item.href;
  const label = item.label.trim().toLowerCase() === "restaurant" ? "Dining" : item.label;
  return { ...item, href, label };
}

export const LEGAL_SECTIONS = [
  "privacy",
  "terms",
  "cancellation",
  "cookies",
  "sitemap",
] as const;

export type LegalSectionId = (typeof LEGAL_SECTIONS)[number];

export function legalSectionPath(section: LegalSectionId): string {
  return `/legal/${section}`;
}

export function roomDetailPath(id: string) {
  return `/rooms/${id}`;
}

export function roomReservePath(slug: string) {
  return `/rooms/${slug}/reserve`;
}

export function articleDetailPath(slug: string) {
  return `/articles/${slug}`;
}

/** Slim header center nav — luxury primary pages. */
export const PRIMARY_NAV_ITEMS = [
  { label: "Overview", href: routes.home },
  { label: "Rooms", href: routes.rooms },
  { label: "Dining", href: routes.dining },
  { label: "Meetings & Events", href: routes.meetingsEvents },
  { label: "Contact", href: routes.contact },
] as const;

export const DRAWER_NAV_ITEMS = [
  { label: "Overview", href: routes.home },
  { label: "Rooms", href: routes.rooms },
  { label: "Dining", href: routes.dining },
  { label: "Spa & Wellness", href: routes.spa },
  { label: "Meetings & Events", href: routes.meetingsEvents },
  { label: "Gallery", href: routes.gallery },
  { label: "Articles", href: routes.articles },
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
    { label: "Meetings & Events", href: routes.meetingsEvents },
    { label: "Gallery", href: routes.gallery },
    { label: "About", href: routes.about },
    { label: "Contact", href: routes.contact },
  ],
  experiences: [
    { label: "Reservations", href: routes.contact },
    { label: "Wellness", href: routes.spa },
  ],
  policies: [
    { label: "Privacy Policy", href: legalSectionPath("privacy") },
    { label: "Terms & Conditions", href: legalSectionPath("terms") },
    { label: "Cancellation Policy", href: legalSectionPath("cancellation") },
    { label: "Cookie Settings", href: legalSectionPath("cookies") },
    { label: "Sitemap", href: legalSectionPath("sitemap") },
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
