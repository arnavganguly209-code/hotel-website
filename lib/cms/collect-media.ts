import type { MediaAsset, SiteContent } from "./types";

export interface CollectedMediaRef {
  url: string;
  pageName: string;
  sectionName: string;
  mediaType: "image" | "video";
  alt?: string;
  title?: string;
  isBackground?: boolean;
  folder?: string;
  category?: string;
}

const MEDIA_EXT = /\.(jpe?g|png|webp|gif|svg|mp4|webm|mov)(\?|$)/i;
const VIDEO_EXT = /\.(mp4|webm|mov)(\?|$)/i;

function isMediaUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (!v || v.startsWith("data:") || v.startsWith("#") || v.startsWith("mailto:")) return false;
  if (v.startsWith("/uploads/") || v.startsWith("/media/") || v.startsWith("/brand/")) return true;
  if (/^https?:\/\//i.test(v) && MEDIA_EXT.test(v)) return true;
  if (/^https?:\/\//i.test(v) && /images\.unsplash\.com|cloudinary|imgix/i.test(v)) return true;
  return false;
}

function mediaTypeFor(url: string): "image" | "video" {
  return VIDEO_EXT.test(url) || /\/video\//i.test(url) ? "video" : "image";
}

function folderFromUrl(url: string): string {
  if (url.includes("/uploads/")) {
    const parts = url.split("/uploads/")[1]?.split("/") ?? [];
    return parts.length > 1 ? parts[0] : "uploads";
  }
  if (url.includes("/media/")) {
    const parts = url.split("/media/")[1]?.split("/") ?? [];
    return parts.length > 1 ? parts[0] : "media";
  }
  return "general";
}

function pushRef(
  out: CollectedMediaRef[],
  seen: Set<string>,
  url: string | undefined,
  meta: Omit<CollectedMediaRef, "url" | "mediaType"> & { mediaType?: "image" | "video" }
) {
  if (!isMediaUrl(url)) return;
  const normalized = url.trim();
  const key = `${normalized}::${meta.pageName}::${meta.sectionName}`;
  if (seen.has(key)) return;
  seen.add(key);
  out.push({
    url: normalized,
    pageName: meta.pageName,
    sectionName: meta.sectionName,
    mediaType: meta.mediaType ?? mediaTypeFor(normalized),
    alt: meta.alt,
    title: meta.title,
    isBackground: meta.isBackground,
    folder: meta.folder ?? folderFromUrl(normalized),
    category: meta.category,
  });
}

function walkCmsMedia(
  out: CollectedMediaRef[],
  seen: Set<string>,
  media:
    | { imageSrc?: string; videoSrc?: string; poster?: string; alt?: string }
    | undefined,
  pageName: string,
  sectionName: string,
  category?: string
) {
  if (!media) return;
  pushRef(out, seen, media.imageSrc, {
    pageName,
    sectionName,
    alt: media.alt,
    category,
    mediaType: "image",
  });
  pushRef(out, seen, media.videoSrc, {
    pageName,
    sectionName,
    alt: media.alt,
    category,
    mediaType: "video",
  });
  pushRef(out, seen, media.poster, {
    pageName,
    sectionName: `${sectionName} Poster`,
    alt: media.alt,
    category,
    mediaType: "image",
  });
}

/** Extract every image/video URL referenced by site content for Orbit visibility. */
export function collectMediaFromContent(content: SiteContent): CollectedMediaRef[] {
  const out: CollectedMediaRef[] = [];
  const seen = new Set<string>();

  pushRef(out, seen, content.header?.logoSrc, {
    pageName: "Global",
    sectionName: "Header Logo",
    category: "General",
    folder: "logo",
  });
  pushRef(out, seen, content.footer?.logoSrc, {
    pageName: "Global",
    sectionName: "Footer Logo",
    category: "General",
    folder: "logo",
  });
  for (const logo of content.footer?.paymentLogos ?? []) {
    pushRef(out, seen, logo.src, {
      pageName: "Global",
      sectionName: "Footer Payment Logo",
      category: "General",
      folder: "payments",
      title: logo.id,
    });
  }
  for (const img of content.footer?.galleryPreview ?? []) {
    pushRef(out, seen, img.src, {
      pageName: "Global",
      sectionName: "Footer Gallery Preview",
      category: "Gallery",
      alt: img.alt,
      folder: "gallery",
    });
  }

  // Home hero (Hero Builder)
  const hero = content.hero;
  if (hero) {
    pushRef(out, seen, hero.imageSrc, {
      pageName: "Home",
      sectionName: "Hero Image",
      category: "Hero",
      isBackground: true,
    });
    pushRef(out, seen, hero.image?.src, {
      pageName: "Home",
      sectionName: "Hero Image Builder",
      category: "Hero",
      isBackground: true,
      alt: hero.image?.alt,
    });
    pushRef(out, seen, hero.image?.mobileSrc, {
      pageName: "Home",
      sectionName: "Hero Image Mobile",
      category: "Hero",
    });
    pushRef(out, seen, hero.image?.tabletSrc, {
      pageName: "Home",
      sectionName: "Hero Image Tablet",
      category: "Hero",
    });
    pushRef(out, seen, hero.image?.desktopSrc, {
      pageName: "Home",
      sectionName: "Hero Image Desktop",
      category: "Hero",
    });
    pushRef(out, seen, hero.videoSrc, {
      pageName: "Home",
      sectionName: "Hero Video",
      category: "Hero",
      mediaType: "video",
    });
    pushRef(out, seen, hero.poster, {
      pageName: "Home",
      sectionName: "Hero Video Poster",
      category: "Hero",
    });
    pushRef(out, seen, hero.previousMedia?.imageSrc, {
      pageName: "Home",
      sectionName: "Hero Previous Image",
      category: "Hero",
    });
    pushRef(out, seen, hero.previousMedia?.videoSrc, {
      pageName: "Home",
      sectionName: "Hero Previous Video",
      category: "Hero",
      mediaType: "video",
    });
    pushRef(out, seen, hero.logo?.src, {
      pageName: "Home",
      sectionName: "Hero Logo",
      category: "Hero",
      folder: "logo",
    });
  }

  for (const url of content.overview?.galleryImages ?? []) {
    pushRef(out, seen, url, {
      pageName: "Home",
      sectionName: "Overview Gallery",
      category: "General",
    });
  }

  for (const exp of content.experiences ?? []) {
    pushRef(out, seen, exp.imageSrc, {
      pageName: "Home",
      sectionName: "Experiences",
      category: "Dining",
      alt: exp.title,
    });
  }

  walkCmsMedia(out, seen, content.culture?.media, "Home", "Culture", "Culture");
  pushRef(out, seen, content.culture?.imageSrc, {
    pageName: "Home",
    sectionName: "Culture Image",
    category: "Culture",
  });
  pushRef(out, seen, content.culture?.circularImage, {
    pageName: "Home",
    sectionName: "Culture Circular Image",
    category: "Culture",
    alt: content.culture?.circularImageAlt,
  });
  for (const card of content.culture?.imageCards ?? []) {
    walkCmsMedia(out, seen, card.media, "Home", `Culture Card · ${card.title}`, "Culture");
  }

  walkCmsMedia(out, seen, content.spaWellnessSection?.media, "Home", "Spa & Wellness", "Spa");
  walkCmsMedia(out, seen, content.facilitiesSection?.media, "Home", "Facilities", "General");
  walkCmsMedia(out, seen, content.fineDiningSection?.media, "Home", "Fine Dining", "Dining");

  pushRef(out, seen, content.diningPage?.hero?.imageSrc, {
    pageName: "Dining",
    sectionName: "Hero",
    category: "Dining",
    isBackground: true,
  });
  pushRef(out, seen, content.diningPage?.welcome?.imageSrc, {
    pageName: "Dining",
    sectionName: "Welcome",
    category: "Dining",
    alt: content.diningPage?.welcome?.imageAlt,
  });
  for (const venue of content.diningPage?.venues ?? []) {
    pushRef(out, seen, (venue as { imageSrc?: string }).imageSrc, {
      pageName: "Dining",
      sectionName: venue.name || "Venue",
      category: "Dining",
    });
  }
  for (const cat of content.diningPage?.menu?.categories ?? []) {
    for (const item of cat.items ?? []) {
      pushRef(out, seen, item.imageSrc, {
        pageName: "Dining",
        sectionName: `${cat.name || "Menu"} · ${item.title || "Dish"}`,
        category: "Dining",
        alt: item.imageAlt,
      });
    }
  }
  for (const portrait of content.diningPage?.chefRecommendation?.portraits ?? []) {
    pushRef(out, seen, portrait.imageSrc, {
      pageName: "Dining",
      sectionName: portrait.caption || "Chef Portrait",
      category: "Dining",
      alt: portrait.imageAlt,
    });
  }
  for (const dish of content.diningPage?.chefRecommendation?.dishes ?? []) {
    pushRef(out, seen, dish.imageSrc, {
      pageName: "Dining",
      sectionName: dish.title || "Chef Recommendation",
      category: "Dining",
      alt: dish.imageAlt,
    });
  }
  for (const img of content.diningPage?.gallery ?? []) {
    pushRef(out, seen, img.src, {
      pageName: "Dining",
      sectionName: img.title || "Gallery",
      category: "Dining",
      alt: img.alt,
    });
  }
  pushRef(out, seen, content.diningPage?.cta?.backgroundImage, {
    pageName: "Dining",
    sectionName: "Final CTA",
    category: "Dining",
    isBackground: true,
  });

  pushRef(out, seen, content.spaPage?.hero?.imageSrc, {
    pageName: "Spa",
    sectionName: "Hero",
    category: "Spa",
    isBackground: true,
  });
  pushRef(out, seen, content.spaPage?.introduction?.imageSrc, {
    pageName: "Spa",
    sectionName: "Introduction",
    category: "Spa",
    alt: content.spaPage?.introduction?.imageAlt,
  });
  for (const t of content.spaPage?.treatments?.items ?? []) {
    pushRef(out, seen, t.imageSrc, {
      pageName: "Spa",
      sectionName: t.name || "Treatment",
      category: "Spa",
      alt: t.imageAlt,
    });
  }

  pushRef(out, seen, content.meetingsEventsPage?.hero?.imageSrc, {
    pageName: "Meetings",
    sectionName: "Hero",
    category: "Events",
    isBackground: true,
  });
  walkCmsMedia(out, seen, content.meetingsEventsPage?.hero?.media, "Meetings", "Hero Media", "Events");

  walkCmsMedia(out, seen, content.galleryPage?.hero?.media, "Gallery", "Hero", "Gallery");
  pushRef(out, seen, content.galleryPage?.hero?.imageSrc, {
    pageName: "Gallery",
    sectionName: "Hero Image",
    category: "Gallery",
    isBackground: true,
  });

  pushRef(out, seen, content.contactPage?.hero?.imageSrc, {
    pageName: "Contact",
    sectionName: "Hero",
    category: "General",
    isBackground: true,
  });
  pushRef(out, seen, content.roomsPage?.hero?.imageSrc, {
    pageName: "Rooms",
    sectionName: "Hero",
    category: "Rooms",
    isBackground: true,
    alt: content.roomsPage?.hero?.imageAlt,
  });
  walkCmsMedia(out, seen, content.articlesPage?.hero?.media, "Articles", "Hero", "Blog");

  pushRef(out, seen, content.aboutPage?.hero?.imageSrc, {
    pageName: "About",
    sectionName: "Hero Cover",
    category: "General",
    folder: "about",
    isBackground: true,
  });
  pushRef(out, seen, content.aboutPage?.story?.imageSrc, {
    pageName: "About",
    sectionName: "Our Story",
    category: "General",
    folder: "about",
  });
  pushRef(out, seen, content.aboutPage?.diningExperience?.imageSrc, {
    pageName: "About",
    sectionName: "Dining Experience",
    category: "Dining",
    folder: "dining",
  });
  pushRef(out, seen, content.aboutPage?.spaWellness?.imageSrc, {
    pageName: "About",
    sectionName: "Spa & Wellness",
    category: "Spa",
    folder: "spa",
  });
  pushRef(out, seen, content.aboutPage?.cta?.backgroundImage, {
    pageName: "About",
    sectionName: "Final CTA Background",
    category: "General",
    folder: "about",
    isBackground: true,
  });
  pushRef(out, seen, content.aboutPage?.seo?.ogImage, {
    pageName: "About",
    sectionName: "SEO OG Image",
    category: "General",
    folder: "seo",
  });
  for (const img of content.aboutPage?.discover?.images ?? []) {
    pushRef(out, seen, img.src, {
      pageName: "About",
      sectionName: "Discover",
      category: "General",
      alt: img.alt,
      folder: "about",
    });
  }
  for (const img of content.aboutPage?.galleryPreview?.images ?? []) {
    pushRef(out, seen, img.src, {
      pageName: "About",
      sectionName: "Gallery Preview",
      category: "Gallery",
      alt: img.alt,
      folder: "about",
    });
  }
  for (const member of content.aboutPage?.team?.members ?? []) {
    pushRef(out, seen, member.imageSrc, {
      pageName: "About",
      sectionName: "Team",
      category: "General",
      alt: member.name,
      folder: "about",
    });
  }
  for (const t of content.aboutPage?.testimonials?.items ?? []) {
    pushRef(out, seen, t.imageSrc, {
      pageName: "About",
      sectionName: "Testimonials",
      category: "General",
      alt: t.name,
      folder: "about",
    });
  }

  for (const room of content.rooms ?? []) {
    pushRef(out, seen, room.imageSrc, {
      pageName: "Rooms",
      sectionName: room.name || "Room",
      category: "Rooms",
      folder: "rooms",
      alt: room.name,
    });
    for (const g of room.gallery ?? []) {
      const src = typeof g === "string" ? g : (g as { src?: string }).src;
      pushRef(out, seen, src, {
        pageName: "Rooms",
        sectionName: `${room.name || "Room"} Gallery`,
        category: "Rooms",
        folder: "rooms",
      });
    }
  }

  for (const item of content.gallery ?? []) {
    if (item.type === "video") continue;
    pushRef(out, seen, item.src, {
      pageName: "Gallery",
      sectionName: item.title || "Gallery Item",
      category: "Gallery",
      folder: "gallery",
      alt: item.alt || item.title,
      mediaType: "image",
    });
  }

  pushRef(out, seen, content.galleryPage?.cta?.backgroundImage, {
    pageName: "Gallery",
    sectionName: "CTA Background",
    category: "Gallery",
    isBackground: true,
  });
  pushRef(out, seen, content.galleryPage?.seo?.ogImage, {
    pageName: "Gallery",
    sectionName: "SEO OG Image",
    category: "Gallery",
  });

  for (const article of content.articles ?? []) {
    pushRef(out, seen, article.coverImage, {
      pageName: "Articles",
      sectionName: article.title || "Article Cover",
      category: "Blog",
      folder: "blog",
      alt: article.coverAlt,
    });
  }

  pushRef(out, seen, content.seo?.ogImage, {
    pageName: "Global",
    sectionName: "Site OG Image",
    category: "General",
    folder: "seo",
  });
  pushRef(out, seen, content.seo?.favicon, {
    pageName: "Global",
    sectionName: "Favicon",
    category: "General",
    folder: "seo",
  });

  // Catch remaining /uploads and /media paths anywhere in content
  deepScan(content, out, seen, "Content", "Referenced Media");

  return out;
}

function deepScan(
  value: unknown,
  out: CollectedMediaRef[],
  seen: Set<string>,
  pageName: string,
  sectionName: string,
  depth = 0
) {
  if (depth > 14 || value == null) return;
  if (typeof value === "string") {
    if (value.startsWith("/uploads/") || value.startsWith("/media/")) {
      pushRef(out, seen, value, { pageName, sectionName });
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) deepScan(item, out, seen, pageName, sectionName, depth + 1);
    return;
  }
  if (typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (key === "mediaLibrary") continue;
      deepScan(child, out, seen, pageName, sectionName, depth + 1);
    }
  }
}

/** Merge collected site media into the Orbit media library (never drops existing uploads). */
export function syncMediaLibraryFromContent(
  content: SiteContent,
  existing: MediaAsset[] = []
): MediaAsset[] {
  const byUrl = new Map<string, MediaAsset>();
  for (const asset of existing) {
    if (!asset?.url) continue;
    byUrl.set(asset.url.trim(), asset);
  }

  const collected = collectMediaFromContent(content);
  let order = 0;
  for (const ref of collected) {
    const prev = byUrl.get(ref.url);
    if (prev) {
      byUrl.set(ref.url, {
        ...prev,
        pageName: ref.pageName || prev.pageName,
        sectionName: ref.sectionName || prev.sectionName,
        mediaType: ref.mediaType || prev.mediaType || mediaTypeFor(ref.url),
        alt: prev.alt || ref.alt || prev.title || "",
        title: prev.title || ref.title || ref.sectionName || prev.filename,
        isBackground: ref.isBackground ?? prev.isBackground,
        visible: prev.visible !== false,
        order: typeof prev.order === "number" ? prev.order : order++,
        category: prev.category || ref.category || "General",
        folder: prev.folder || ref.folder || folderFromUrl(ref.url),
        mimeType:
          prev.mimeType ||
          (ref.mediaType === "video" ? "video/mp4" : "image/jpeg"),
      });
      continue;
    }

    const filename = ref.url.split("?")[0]?.split("/").pop() || "media";
    const idSeed = ref.url.replace(/[^a-zA-Z0-9]+/g, "").slice(-28) || `m${order}`;
    byUrl.set(ref.url, {
      id: `sync-${idSeed}`,
      filename,
      url: ref.url,
      publicId: ref.url.replace(/^\//, ""),
      folder: ref.folder || folderFromUrl(ref.url),
      mimeType: ref.mediaType === "video" ? "video/mp4" : "image/jpeg",
      size: 0,
      createdAt: new Date(0).toISOString(),
      title: ref.title || ref.sectionName || filename,
      alt: ref.alt || ref.title || ref.sectionName || "",
      category: ref.category || "General",
      pageName: ref.pageName,
      sectionName: ref.sectionName,
      mediaType: ref.mediaType,
      visible: true,
      order: order++,
      isBackground: ref.isBackground === true,
    });
  }

  return Array.from(byUrl.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
