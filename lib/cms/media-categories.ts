/** Media categories for Orbit Media Library (WordPress-style). */
export const MEDIA_CATEGORIES = [
  "Gallery",
  "Rooms",
  "Spa",
  "Dining",
  "Culture",
  "General",
  "Hero",
  "Blog",
  "Other",
] as const;

export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

export const GALLERY_DISPLAY_CATEGORIES = [
  "All",
  "Rooms",
  "Hotel",
  "Spa",
  "Restaurant",
  "Events",
  "General",
  "Culture",
  "Dining",
] as const;

/** Map Orbit folder names to media categories. */
export function categoryFromFolder(folder: string): MediaCategory {
  const f = folder.toLowerCase();
  if (f.includes("room")) return "Rooms";
  if (f.includes("spa") || f.includes("wellness")) return "Spa";
  if (f.includes("dining") || f.includes("cafe") || f.includes("lounge") || f.includes("restaurant"))
    return "Dining";
  if (f.includes("culture")) return "Culture";
  if (f.includes("hero")) return "Hero";
  if (f.includes("gallery")) return "Gallery";
  if (f.includes("blog")) return "Blog";
  if (f.includes("logo") || f.includes("seo") || f.includes("library")) return "General";
  return "Other";
}

export function folderFromCategory(category: string): string {
  const map: Record<string, string> = {
    Gallery: "gallery",
    Rooms: "rooms",
    Spa: "spa",
    Dining: "dining",
    Culture: "culture",
    General: "library",
    Hero: "hero",
    Blog: "blog",
    Other: "uploads",
  };
  return map[category] ?? "uploads";
}
