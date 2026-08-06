/**
 * Exact perceived color of the live booking/search bar
 * (sampled from production screenshot ≈ #2F543D, premium cream-green).
 * Do not change the search box — header/drawer only.
 */
export const HEADER_SEARCH_MATCH = {
  backgroundColor: "#2F543D",
  backgroundImage:
    "linear-gradient(160deg, #355C49 0%, #2F543D 48%, #2C503A 100%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 28px rgba(8,20,14,0.22)",
} as const;

/** @deprecated alias */
export const HEADER_CREAM_GREEN = HEADER_SEARCH_MATCH;
