import { defaultHeroBuilder } from "@/lib/cms/hero-builder-defaults";

/**
 * Exact same CSS background as the hero booking/search bar.
 * Do not change the search box — header + hamburger drawer only.
 */
export const SEARCH_BOX_BACKGROUND =
  defaultHeroBuilder.bookingBar.background ||
  "linear-gradient(160deg, #2A5540 0%, #204732 55%, #26503B 100%)";

/** Soft cream wash so solid header reads like the search bar’s cream-green glass */
export const HEADER_SEARCH_MATCH = {
  backgroundColor: "#204732",
  backgroundImage: `linear-gradient(180deg, rgba(236, 242, 228, 0.14) 0%, rgba(236, 242, 228, 0.05) 42%, transparent 72%), ${SEARCH_BOX_BACKGROUND}`,
  boxShadow:
    "inset 0 1px 0 rgba(255,248,230,0.12), 0 8px 28px rgba(8,20,14,0.22)",
} as const;

/** @deprecated alias */
export const HEADER_CREAM_GREEN = HEADER_SEARCH_MATCH;
