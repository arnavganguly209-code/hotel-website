/**
 * Match the hero booking/search bar frame
 * (lib/cms/hero-builder-defaults.ts → bookingBar.background)
 */
export const HEADER_SEARCH_MATCH = {
  backgroundColor: "#204732",
  backgroundImage: "linear-gradient(160deg, #2A5540 0%, #204732 55%, #26503B 100%)",
} as const;

/** @deprecated alias — same as search-box match */
export const HEADER_CREAM_GREEN = HEADER_SEARCH_MATCH;
