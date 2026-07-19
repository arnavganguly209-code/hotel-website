import { existsSync } from "node:fs";
import type { SiteContent } from "./types";
import { defaultContent } from "./default-content";
import { enrichRoom } from "./room-helpers";
import {
  isPaymentLogoCleared,
  OFFICIAL_PAYMENT_LOGOS,
  PAYMENT_LOGO_CLEARED,
} from "./payment-logos";
import { resolveLocalUploadPath } from "@/lib/uploads";
import { routes } from "@/lib/navigation";

function ensureMeetingsNavItem(items: SiteContent["header"]["menuItems"]) {
  const hasMeetings = items.some(
    (item) =>
      item.href === routes.meetingsEvents || item.href === "/meetings-weddings"
  );
  if (hasMeetings) {
    return items.map((item) =>
      item.href === "/meetings-weddings"
        ? { ...item, href: routes.meetingsEvents, label: "Meetings & Events" }
        : item
    );
  }
  const spaIndex = items.findIndex((item) => item.href === routes.spa);
  const entry = { label: "Meetings & Events", href: routes.meetingsEvents };
  if (spaIndex >= 0) {
    const next = [...items];
    next.splice(spaIndex + 1, 0, entry);
    return next;
  }
  return [...items, entry];
}

function ensureArticlesNavItem(items: SiteContent["header"]["menuItems"]) {
  const hasArticles = items.some((item) => item.href === routes.articles);
  if (hasArticles) {
    return items.map((item) =>
      item.href === routes.articles ? { ...item, label: "Articles" } : item
    );
  }
  const galleryIndex = items.findIndex((item) => item.href === routes.gallery);
  const entry = { label: "Articles", href: routes.articles };
  if (galleryIndex >= 0) {
    const next = [...items];
    next.splice(galleryIndex + 1, 0, entry);
    return next;
  }
  const aboutIndex = items.findIndex((item) => item.href === routes.about);
  if (aboutIndex >= 0) {
    const next = [...items];
    next.splice(aboutIndex, 0, entry);
    return next;
  }
  return [...items, entry];
}

/** Preserve explicit empty values — never fall back to defaults when the field was set. */
function definedString(value: string | undefined, fallback: string): string {
  return value !== undefined ? value : fallback;
}

function definedArray<T>(value: T[] | undefined, fallback: T[]): T[] {
  return value !== undefined ? value : fallback;
}

function mergePaymentLogos(
  partial?: SiteContent["footer"]["paymentLogos"]
): SiteContent["footer"]["paymentLogos"] {
  const defaults = defaultContent.footer.paymentLogos.map((slot, i) => ({
    id: slot.id || OFFICIAL_PAYMENT_LOGOS[i].id,
    src: slot.src || OFFICIAL_PAYMENT_LOGOS[i].src,
  }));

  if (!partial?.length) return defaults.map((slot) => ({ ...slot }));

  return defaults.map((slot, i) => {
    const incoming = partial[i]?.src;
    const id = partial[i]?.id || slot.id;

    // Explicit Orbit delete — keep cleared sentinel so UI can show placeholder
    if (typeof incoming === "string" && isPaymentLogoCleared(incoming)) {
      return { id, src: PAYMENT_LOGO_CLEARED };
    }

    const trimmed = typeof incoming === "string" ? incoming.trim() : "";

    // Keep Orbit uploads only when the file still exists on disk.
    // Missing files (failed/orphaned uploads) fall back to official — never a broken placeholder.
    if (trimmed.includes("/uploads/")) {
      const abs = resolveLocalUploadPath(trimmed);
      if (abs && existsSync(abs)) {
        return { id, src: trimmed };
      }
      console.warn(
        "[CMS] Payment upload missing on disk — using official logo:",
        trimmed
      );
      return { id, src: slot.src };
    }

    // Bundled official logo path
    if (trimmed.includes("/media/payments/")) {
      return { id, src: trimmed };
    }

    // Empty / missing / unknown → official bundled logo (first-load / migration only)
    return { id, src: slot.src };
  });
}

type LegacyFooterSocial = Partial<SiteContent["footer"]["social"]> & {
  youtube?: string;
  twitter?: string;
  linkedin?: string;
};

function mergeFooterSocial(
  partial?: LegacyFooterSocial,
  hotelSocial?: SiteContent["hotel"]["social"]
): SiteContent["footer"]["social"] {
  const defaults = defaultContent.footer.social;
  return {
    facebook: definedString(partial?.facebook, defaults.facebook),
    instagram: definedString(partial?.instagram, defaults.instagram),
    tripadvisor: definedString(
      partial?.tripadvisor,
      hotelSocial?.tripadvisor || defaults.tripadvisor
    ),
    googleReviews: definedString(partial?.googleReviews, defaults.googleReviews),
    facebookIcon: definedString(partial?.facebookIcon, defaults.facebookIcon),
    instagramIcon: definedString(partial?.instagramIcon, defaults.instagramIcon),
    tripadvisorIcon: definedString(partial?.tripadvisorIcon, defaults.tripadvisorIcon),
    googleReviewsIcon: definedString(partial?.googleReviewsIcon, defaults.googleReviewsIcon),
  };
}

export function mergeWithDefaults(partial: Partial<SiteContent>): SiteContent {
  return {
    hotel: { ...defaultContent.hotel, ...partial.hotel },
    header: {
      ...defaultContent.header,
      ...partial.header,
      menuItems: ensureArticlesNavItem(
        ensureMeetingsNavItem(
          definedArray(partial.header?.menuItems, defaultContent.header.menuItems)
        )
      ),
      overlayMenuItems: partial.header?.overlayMenuItems ?? defaultContent.header.overlayMenuItems,
    },
    hero: mergeHero(defaultContent.hero, partial.hero),
    homeSections: {
      ...defaultContent.homeSections,
      ...(partial.homeSections ?? {}),
      hero: { ...defaultContent.homeSections.hero, ...partial.homeSections?.hero },
      welcome: { ...defaultContent.homeSections.welcome, ...partial.homeSections?.welcome },
      aboutPreview: { ...defaultContent.homeSections.aboutPreview, ...partial.homeSections?.aboutPreview },
      rooms: { ...defaultContent.homeSections.rooms, ...partial.homeSections?.rooms },
      facilities: { ...defaultContent.homeSections.facilities, ...partial.homeSections?.facilities },
      dining: { ...defaultContent.homeSections.dining, ...partial.homeSections?.dining },
      spa: { ...defaultContent.homeSections.spa, ...partial.homeSections?.spa },
      meetingsEvents: { ...defaultContent.homeSections.meetingsEvents, ...partial.homeSections?.meetingsEvents },
      exploreKathmandu: {
        ...defaultContent.homeSections.exploreKathmandu,
        ...partial.homeSections?.exploreKathmandu,
      },
      gallery: { ...defaultContent.homeSections.gallery, ...partial.homeSections?.gallery },
      testimonials: { ...defaultContent.homeSections.testimonials, ...partial.homeSections?.testimonials },
      articles: { ...defaultContent.homeSections.articles, ...partial.homeSections?.articles },
      cta: { ...defaultContent.homeSections.cta, ...partial.homeSections?.cta },
    },
    overview: mergeOverview(defaultContent.overview, partial.overview),
    roomsSection: {
      ...defaultContent.roomsSection,
      ...(partial.roomsSection ?? {}),
      ctaVisible: partial.roomsSection?.ctaVisible !== false,
      showMist: partial.roomsSection?.showMist !== false,
    },
    experiences: definedArray(partial.experiences, defaultContent.experiences),
    locationAdvantages: definedArray(partial.locationAdvantages, defaultContent.locationAdvantages),
    culture: mergeCulture(defaultContent.culture, partial.culture),
    facilitiesSection: mergeFacilitiesSection(defaultContent.facilitiesSection, partial.facilitiesSection),
    fineDiningSection: mergeFineDiningSection(defaultContent.fineDiningSection, partial.fineDiningSection),
    lobbyCafeSection: mergeLobbyCafeSection(defaultContent.lobbyCafeSection, partial.lobbyCafeSection),
    rooftopExperienceSection: mergeRooftopExperienceSection(
      defaultContent.rooftopExperienceSection,
      partial.rooftopExperienceSection
    ),
    spaWellnessSection: mergeSpaWellnessSection(
      defaultContent.spaWellnessSection,
      partial.spaWellnessSection
    ),
    meetingsEventsSection: mergeMeetingsEventsSection(
      defaultContent.meetingsEventsSection,
      partial.meetingsEventsSection
    ),
    exploreKathmanduSection: mergeExploreKathmanduSection(
      defaultContent.exploreKathmanduSection,
      partial.exploreKathmanduSection
    ),
    culturalExperiencePage: mergeCulturalExperiencePage(
      defaultContent.culturalExperiencePage,
      partial.culturalExperiencePage
    ),
    facilities: definedArray(partial.facilities, defaultContent.facilities).map((f, i) => {
      const base = defaultContent.facilities[i] ?? defaultContent.facilities[0];
      return {
        ...base,
        ...f,
        id: f.id || base.id,
        name: f.name || base.name,
        description: f.description ?? base.description ?? "",
        icon: f.icon || base.icon,
        iconSrc: f.iconSrc ?? base.iconSrc ?? "",
        enabled: f.enabled !== false,
        order: typeof f.order === "number" ? f.order : (base.order ?? i),
      };
    }),
    rooms: definedArray(partial.rooms, defaultContent.rooms).map((room, i) =>
      enrichRoom(defaultContent.rooms[i] ?? defaultContent.rooms[0], room)
    ),
    roomBooking: { ...defaultContent.roomBooking, ...(partial.roomBooking ?? {}) },
    diningPage: mergeDiningPage(defaultContent.diningPage, partial.diningPage),
    spaPage: mergeSpaPage(defaultContent.spaPage, partial.spaPage),
    meetingsEventsPage: mergeMeetingsEventsPage(
      defaultContent.meetingsEventsPage,
      partial.meetingsEventsPage
    ),
    aboutPage: mergeAboutPage(defaultContent.aboutPage, partial.aboutPage),
    reviews: definedArray(partial.reviews, defaultContent.reviews),
    gallery: (() => {
      const merged = definedArray(partial.gallery, defaultContent.gallery).map((item, i) => ({
        ...(defaultContent.gallery[i] ?? defaultContent.gallery[0]),
        ...item,
        type: item.type ?? "image",
        description: item.description ?? defaultContent.gallery[i]?.description ?? "",
        alt: item.alt ?? item.title ?? "",
        active: item.active !== false,
        showOnHome: item.showOnHome !== false,
        featured: item.featured === true,
        poster: item.poster ?? "",
        order: item.order ?? i,
      }));

      const hasFeatured = merged.some((item) => item.featured === true);
      if (!hasFeatured) {
        merged.slice(0, 4).forEach((item) => {
          item.featured = true;
        });
      }

      const hasVideo = merged.some((item) => item.type === "video");
      if (!hasVideo) {
        const videos = defaultContent.gallery.filter((item) => item.type === "video");
        const maxOrder = merged.reduce((m, item) => Math.max(m, item.order ?? 0), 0);
        videos.forEach((video, i) => {
          if (!merged.some((item) => item.id === video.id)) {
            merged.push({
              ...video,
              alt: video.alt ?? video.title,
              active: video.active !== false,
              showOnHome: video.showOnHome !== false,
              featured: video.featured === true,
              poster: video.poster ?? "",
              description: video.description ?? "",
              type: "video" as const,
              order: maxOrder + 1 + i,
            });
          }
        });
      }

      return merged;
    })(),
    galleryCategories: (() => {
      const merged = definedArray(
        partial.galleryCategories,
        defaultContent.galleryCategories
      ).map((cat, i) => ({
        ...(defaultContent.galleryCategories[i] ?? {
          id: `cat-${i}`,
          name: "Category",
          enabled: true,
          order: i,
        }),
        ...cat,
        enabled: cat.enabled !== false,
        order: typeof cat.order === "number" ? cat.order : i,
        icon: cat.icon ?? "",
      }));

      const names = new Set(merged.map((c) => c.name.toLowerCase()));
      let order = merged.reduce((m, c) => Math.max(m, c.order ?? 0), 0);
      for (const def of defaultContent.galleryCategories) {
        if (!names.has(def.name.toLowerCase())) {
          order += 1;
          merged.push({ ...def, icon: def.icon ?? "", order });
        }
      }
      return merged;
    })(),
    gallerySection: mergeGallerySection(
      defaultContent.gallerySection,
      partial.gallerySection
    ),
    articlesHomeSection: mergeArticlesHomeSection(
      defaultContent.articlesHomeSection,
      partial.articlesHomeSection
    ),
    galleryPage: mergeGalleryPage(defaultContent.galleryPage, partial.galleryPage),
    articlesPage: {
      ...defaultContent.articlesPage,
      ...(partial.articlesPage ?? {}),
      hero: {
        ...defaultContent.articlesPage.hero,
        ...(partial.articlesPage?.hero ?? {}),
        media: {
          ...defaultContent.articlesPage.hero.media,
          ...(partial.articlesPage?.hero?.media ?? {}),
        },
      },
      seo: { ...defaultContent.articlesPage.seo, ...(partial.articlesPage?.seo ?? {}) },
      sidebar: {
        ...defaultContent.articlesPage.sidebar,
        ...(partial.articlesPage?.sidebar ?? {}),
      },
      newsletterCta: {
        ...defaultContent.articlesPage.newsletterCta,
        ...(partial.articlesPage?.newsletterCta ?? {}),
      },
    },
    articleAuthors: definedArray(
      partial.articleAuthors,
      defaultContent.articleAuthors
    ).map((a, i) => ({
      ...(defaultContent.articleAuthors[i] ?? defaultContent.articleAuthors[0]),
      ...a,
      social: {
        ...(defaultContent.articleAuthors[i] ?? defaultContent.articleAuthors[0]).social,
        ...(a.social ?? {}),
      },
    })),
    articleCategories: definedArray(
      partial.articleCategories,
      defaultContent.articleCategories
    ).map((c, i) => ({
      ...(defaultContent.articleCategories[i] ?? {
        id: `cat-${i}`,
        name: "Category",
        slug: `category-${i}`,
        enabled: true,
        order: i,
      }),
      ...c,
      enabled: c.enabled !== false,
      order: typeof c.order === "number" ? c.order : i,
    })),
    articleTags: definedArray(partial.articleTags, defaultContent.articleTags),
    articles: (() => {
      const merged = definedArray(partial.articles, defaultContent.articles).map(
        (article, i) => {
          const base = defaultContent.articles[i] ?? defaultContent.articles[0];
          return {
            ...base,
            ...article,
            tagIds: article.tagIds ?? base.tagIds ?? [],
            relatedIds: article.relatedIds ?? base.relatedIds ?? [],
            seo: { ...base.seo, ...(article.seo ?? {}) },
            faq: definedArray(article.faq, base.faq ?? []),
            toc: definedArray(article.toc, base.toc ?? []),
            revisions: article.revisions ?? [],
            status: article.status ?? "published",
            featured: article.featured === true,
            pinned: article.pinned === true,
            allowComments: article.allowComments !== false,
            order: typeof article.order === "number" ? article.order : i,
          };
        }
      );
      if (merged.length === 0) return defaultContent.articles;
      const ids = new Set(merged.map((a) => a.id));
      for (const def of defaultContent.articles) {
        if (!ids.has(def.id) && !merged.some((a) => a.slug === def.slug)) {
          merged.push({ ...def, revisions: def.revisions ?? [] });
        }
      }
      return merged;
    })(),
    roomsPage: { ...defaultContent.roomsPage, ...(partial.roomsPage ?? {}) },
    contactPage: mergeContactPage(partial.contactPage),
    contact: { ...defaultContent.contact, ...(partial.contact ?? {}) },
    seo: { ...defaultContent.seo, ...partial.seo },
    performanceSettings: {
      ...defaultContent.performanceSettings,
      ...(partial.performanceSettings ?? {}),
      lazyLoadImages: partial.performanceSettings?.lazyLoadImages !== false,
      reduceMotionOnMobile: partial.performanceSettings?.reduceMotionOnMobile !== false,
      pwaEnabled: partial.performanceSettings?.pwaEnabled !== false,
      imageFadeIn: partial.performanceSettings?.imageFadeIn !== false,
      cacheStaticAssets: partial.performanceSettings?.cacheStaticAssets !== false,
    },
    theme: { ...defaultContent.theme, ...(partial.theme ?? {}) },
    settings: { ...defaultContent.settings, ...(partial.settings ?? {}) },
    footer: {
      ...defaultContent.footer,
      ...(partial.footer ?? {}),
      contact: { ...defaultContent.footer.contact, ...(partial.footer?.contact ?? {}) },
      newsletter: { ...defaultContent.footer.newsletter, ...(partial.footer?.newsletter ?? {}) },
      social: mergeFooterSocial(partial.footer?.social, partial.hotel?.social),
      colors: { ...defaultContent.footer.colors, ...(partial.footer?.colors ?? {}) },
      spacing: { ...defaultContent.footer.spacing, ...(partial.footer?.spacing ?? {}) },
      quickLinks: definedArray(partial.footer?.quickLinks, defaultContent.footer.quickLinks),
      galleryPreview: definedArray(
        partial.footer?.galleryPreview,
        defaultContent.footer.galleryPreview
      ),
      enabledPayments: definedArray(
        partial.footer?.enabledPayments,
        defaultContent.footer.enabledPayments
      ),
      paymentLogos: mergePaymentLogos(partial.footer?.paymentLogos),
      legalLinks: definedArray(partial.footer?.legalLinks, defaultContent.footer.legalLinks),
      showMountains:
        partial.footer?.showMountains ?? defaultContent.footer.showMountains,
    },
    mediaLibrary: definedArray(partial.mediaLibrary, defaultContent.mediaLibrary),
  };
}

function mergeHero(
  defaults: SiteContent["hero"],
  partial?: Partial<SiteContent["hero"]>
): SiteContent["hero"] {
  if (!partial) return defaults;

  // Content saved before the 2026 hero redesign has no `features` field. The old
  // hero never rendered text/CTA/overlay and hardcoded the booking bar styling,
  // so those stored values are stale — drop them and let the new defaults apply.
  // User-managed data (hero image, video, SEO, booking bar enabled/fields) is kept.
  if (partial.features === undefined) {
    const {
      welcomeText: _w,
      title: _t,
      subtitle: _s,
      description: _d,
      showTitle: _st,
      overlayOpacity: _oo,
      overlayColor: _oc,
      primaryButton: _pb,
      secondaryButton: _sb,
      titleStyle: _ts,
      subtitleStyle: _ss,
      descriptionStyle: _ds,
      welcomeStyle: _ws,
      bookingBar: legacyBookingBar,
      ...rest
    } = partial;
    partial = { ...rest };
    if (legacyBookingBar) {
      const kept: Partial<SiteContent["hero"]["bookingBar"]> = {};
      if (legacyBookingBar.enabled !== undefined) kept.enabled = legacyBookingBar.enabled;
      if (legacyBookingBar.buttonText !== undefined) kept.buttonText = legacyBookingBar.buttonText;
      if (legacyBookingBar.fields !== undefined) kept.fields = legacyBookingBar.fields;
      partial.bookingBar = kept as SiteContent["hero"]["bookingBar"];
    }
  }

  // The first hero redesign shipped 3.5rem / 1.12 heading defaults which sites
  // saved untouched from Orbit; normalize those exact values to the refined
  // typography. Admin-customized sizes are left as-is.
  if (partial.titleStyle?.desktopFontSize === "3.5rem" && partial.titleStyle?.lineHeight === "1.12") {
    const { titleStyle: _staleTitle, ...rest } = partial;
    partial = rest;
  }
  if (partial.subtitleStyle?.desktopFontSize === "3.5rem" && partial.subtitleStyle?.lineHeight === "1.12") {
    const { subtitleStyle: _staleSubtitle, ...rest } = partial;
    partial = rest;
  }

  // Default "center" crop over-zooms the cinematic dusk photo on wide desktops —
  // promote to the framing that keeps the building, sky and room extension visible.
  if (partial.image && (partial.image.position === "center" || partial.image.position === "center center")) {
    partial = {
      ...partial,
      image: {
        ...partial.image,
        position: defaults.image.position,
        scale: partial.image.scale && partial.image.scale > 1 ? 1 : partial.image.scale,
      },
    };
  }

  // The rebuilt hero has no "none" state: legacy clean-background records move
  // to the bundled demo video until an administrator publishes image/video media.
  const legacyVideoSrc =
    partial.videoSrc?.split("?")[0] ===
    "/uploads/hero/3d63d021-fdda-4380-a5d9-c7da90e8d6d4.mp4";
  const legacyMedia =
    partial.schemaVersion !== 2 ||
    !partial.mediaMode ||
    partial.mediaMode === "none" ||
    legacyVideoSrc;

  return {
    ...defaults,
    ...partial,
    schemaVersion: 2,
    mediaMode: partial.mediaMode === "image" ? "image" : "video",
    videoSrc: partial.videoSrc?.trim() || defaults.videoSrc,
    poster: partial.poster?.trim() || defaults.poster,
    overlayOpacity: legacyMedia
      ? defaults.overlayOpacity
      : (partial.overlayOpacity ?? defaults.overlayOpacity),
    overlayColor: legacyMedia
      ? defaults.overlayColor
      : (partial.overlayColor ?? defaults.overlayColor),
    colors: { ...defaults.colors, ...partial.colors },
    image: { ...defaults.image, ...partial.image },
    logo: { ...defaults.logo, ...partial.logo },
    titleStyle: { ...defaults.titleStyle, ...partial.titleStyle },
    subtitleStyle: { ...defaults.subtitleStyle, ...partial.subtitleStyle },
    descriptionStyle: { ...defaults.descriptionStyle, ...partial.descriptionStyle },
    welcomeStyle: { ...defaults.welcomeStyle, ...partial.welcomeStyle },
    primaryButton: { ...defaults.primaryButton, ...partial.primaryButton },
    secondaryButton: { ...defaults.secondaryButton, ...partial.secondaryButton },
    features: definedArray(partial.features, defaults.features),
    previousMedia: { ...defaults.previousMedia, ...partial.previousMedia },
    bookingBar: {
      ...defaults.bookingBar,
      ...partial.bookingBar,
      defaults: { ...defaults.bookingBar.defaults, ...partial.bookingBar?.defaults },
      fields: { ...defaults.bookingBar.fields, ...partial.bookingBar?.fields },
      colors: { ...defaults.bookingBar.colors, ...partial.bookingBar?.colors },
      labels: { ...defaults.bookingBar.labels, ...partial.bookingBar?.labels },
      icons: { ...defaults.bookingBar.icons, ...partial.bookingBar?.icons },
      animations: { ...defaults.bookingBar.animations, ...partial.bookingBar?.animations },
      responsive: {
        ...defaults.bookingBar.responsive,
        ...(legacyMedia ? undefined : partial.bookingBar?.responsive),
      },
    },
    effects: { ...defaults.effects, ...partial.effects },
    floating: { ...defaults.floating, ...partial.floating },
    animations: { ...defaults.animations, ...partial.animations },
    responsive: { ...defaults.responsive, ...partial.responsive },
    seo: { ...defaults.seo, ...partial.seo },
  };
}

function mergePageSection<T extends { hero: object; cta: object; seo?: object }>(
  defaults: T,
  partial?: Partial<T>
): T {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    hero: { ...defaults.hero, ...(partial.hero ?? {}) },
    cta: { ...defaults.cta, ...(partial.cta ?? {}) },
    seo: { ...(defaults.seo ?? {}), ...(partial.seo ?? {}) },
  } as T;
}

function mergeDiningPage(
  defaults: SiteContent["diningPage"],
  partial?: Partial<SiteContent["diningPage"]> & {
    intro?: { title?: string; content?: string };
    highlights?: Array<{ title: string; description: string }>;
  }
): SiteContent["diningPage"] {
  if (!partial) return defaults;

  const legacyIntro = (partial as { intro?: { title?: string; content?: string } }).intro;

  const venues = definedArray(partial.venues, defaults.venues).map((venue, i) => {
    const base = defaults.venues[i] ?? defaults.venues[0];
    return {
      id: venue.id || base.id,
      enabled: venue.enabled !== false,
      order: typeof venue.order === "number" ? venue.order : (base.order ?? i),
      name: definedString(venue.name, base.name),
      tagline: definedString(venue.tagline, base.tagline),
      description: definedString(venue.description, base.description),
      cuisine: definedString(venue.cuisine, base.cuisine),
      hours: definedString(venue.hours, base.hours),
      capacity: definedString(venue.capacity, base.capacity),
      signaturesLabel: definedString(venue.signaturesLabel, base.signaturesLabel),
      signatures: definedArray(venue.signatures, base.signatures),
      features: definedArray(venue.features, base.features),
      imageSrc: definedString(venue.imageSrc, base.imageSrc),
      imageAlt: definedString(venue.imageAlt, base.imageAlt || venue.name || base.name),
      ctaText: definedString(venue.ctaText, base.ctaText),
      ctaHref: definedString(venue.ctaHref, base.ctaHref),
    };
  });

  const menuCategories = definedArray(
    partial.menu?.categories,
    defaults.menu.categories
  ).map((cat, i) => {
    const base = defaults.menu.categories[i] ?? defaults.menu.categories[0];
    return {
      id: cat.id || base.id,
      name: definedString(cat.name, base.name),
      enabled: cat.enabled !== false,
      order: typeof cat.order === "number" ? cat.order : (base.order ?? i),
      items: definedArray(cat.items, base.items).map((item, j) => {
        const itemBase = base.items[j] ?? base.items[0];
        return {
          id: item.id || itemBase?.id || `mi-${i}-${j}`,
          enabled: item.enabled !== false,
          order: typeof item.order === "number" ? item.order : (itemBase?.order ?? j),
          title: definedString(item.title, itemBase?.title ?? ""),
          description: definedString(item.description, itemBase?.description ?? ""),
          price: definedString(item.price, itemBase?.price ?? ""),
          imageSrc: definedString(item.imageSrc, itemBase?.imageSrc ?? ""),
          imageAlt: definedString(item.imageAlt, itemBase?.imageAlt ?? item.title ?? ""),
          chefRecommended: item.chefRecommended === true,
        };
      }),
    };
  });

  const gallery = definedArray(partial.gallery, defaults.gallery).map((item, i) => {
    const base = defaults.gallery[i] ?? defaults.gallery[0];
    const legacy = item as { src?: string; title?: string; alt?: string };
    return {
      id: item.id || base.id,
      src: definedString(legacy.src, base.src),
      title: definedString(legacy.title, base.title),
      alt: definedString(legacy.alt, base.alt || legacy.title || base.title),
      enabled: item.enabled !== false,
      order: typeof item.order === "number" ? item.order : (base.order ?? i),
    };
  });

  return {
    ...defaults,
    ...partial,
    hero: {
      ...defaults.hero,
      ...(partial.hero ?? {}),
    },
    seo: {
      ...defaults.seo,
      ...(partial.seo ?? {}),
    },
    welcome: {
      ...defaults.welcome,
      ...(partial.welcome ?? {}),
      title: definedString(
        partial.welcome?.title ?? legacyIntro?.title,
        defaults.welcome.title
      ),
      content: definedString(
        partial.welcome?.content ?? legacyIntro?.content,
        defaults.welcome.content
      ),
    },
    destinations: {
      ...defaults.destinations,
      ...(partial.destinations ?? {}),
    },
    venues,
    menu: {
      ...defaults.menu,
      ...(partial.menu ?? {}),
      categories: menuCategories,
    },
    chefRecommendation: {
      ...defaults.chefRecommendation,
      ...(partial.chefRecommendation ?? {}),
      dishes: definedArray(
        partial.chefRecommendation?.dishes,
        defaults.chefRecommendation.dishes
      ).map((dish, i) => {
        const base = defaults.chefRecommendation.dishes[i] ?? defaults.chefRecommendation.dishes[0];
        return {
          id: dish.id || base.id,
          enabled: dish.enabled !== false,
          order: typeof dish.order === "number" ? dish.order : (base.order ?? i),
          title: definedString(dish.title, base.title),
          description: definedString(dish.description, base.description),
          price: definedString(dish.price, base.price),
          imageSrc: definedString(dish.imageSrc, base.imageSrc),
          imageAlt: definedString(dish.imageAlt, base.imageAlt),
        };
      }),
    },
    form: {
      ...defaults.form,
      ...(partial.form ?? {}),
      restaurantOptions: definedArray(
        partial.form?.restaurantOptions,
        defaults.form.restaurantOptions
      ),
      occasionOptions: definedArray(
        partial.form?.occasionOptions,
        defaults.form.occasionOptions
      ),
    },
    gallerySection: {
      ...defaults.gallerySection,
      ...(partial.gallerySection ?? {}),
    },
    gallery,
    reviews: {
      ...defaults.reviews,
      ...(partial.reviews ?? {}),
      items: definedArray(partial.reviews?.items, defaults.reviews.items).map((item, i) => {
        const base = defaults.reviews.items[i] ?? defaults.reviews.items[0];
        return {
          id: item.id || base.id,
          enabled: item.enabled !== false,
          order: typeof item.order === "number" ? item.order : (base.order ?? i),
          name: definedString(item.name, base.name),
          country: definedString(item.country, base.country),
          rating: typeof item.rating === "number" ? item.rating : base.rating,
          review: definedString(item.review, base.review),
          photoSrc: definedString(item.photoSrc, base.photoSrc),
        };
      }),
    },
    faq: {
      ...defaults.faq,
      ...(partial.faq ?? {}),
      items: definedArray(partial.faq?.items, defaults.faq.items).map((item, i) => {
        const base = defaults.faq.items[i] ?? defaults.faq.items[0];
        return {
          id: item.id || base.id,
          question: definedString(item.question, base.question),
          answer: definedString(item.answer, base.answer),
          enabled: item.enabled !== false,
          order: typeof item.order === "number" ? item.order : (base.order ?? i),
        };
      }),
    },
    cta: {
      ...defaults.cta,
      ...(partial.cta ?? {}),
    },
  };
}

function mergeSpaPage(
  defaults: SiteContent["spaPage"],
  partial?: Partial<SiteContent["spaPage"]> & {
    philosophy?: { title?: string; content?: string; imageSrc?: string };
    services?: Array<{ id?: string; name?: string; description?: string }>;
  }
): SiteContent["spaPage"] {
  if (!partial) return defaults;

  const legacyPhilosophy = partial.philosophy;
  const legacyServices = partial.services;

  const treatmentItems = definedArray(
    partial.treatments?.items ??
      legacyServices?.map((s, i) => ({
        id: s.id || `t${i}`,
        name: s.name || "",
        description: s.description || "",
        enabled: true,
        order: i,
        icon: "Flower2",
        imageSrc: "",
        imageAlt: s.name || "",
      })),
    defaults.treatments.items
  ).map((item, i) => {
    const base = defaults.treatments.items[i] ?? defaults.treatments.items[0];
    return {
      id: item.id || base.id,
      enabled: item.enabled !== false,
      order: typeof item.order === "number" ? item.order : (base.order ?? i),
      name: definedString(item.name, base.name),
      description: definedString(item.description, base.description),
      icon: definedString(item.icon, base.icon),
      imageSrc: definedString(item.imageSrc, base.imageSrc),
      imageAlt: definedString(item.imageAlt, base.imageAlt),
    };
  });

  const gallery = definedArray(partial.gallery, defaults.gallery).map((item, i) => {
    const base = defaults.gallery[i] ?? defaults.gallery[0];
    const legacy = item as { src?: string; title?: string; alt?: string };
    return {
      id: item.id || base.id,
      src: definedString(legacy.src, base.src),
      title: definedString(legacy.title, base.title),
      alt: definedString(legacy.alt, base.alt || legacy.title || base.title),
      enabled: item.enabled !== false,
      order: typeof item.order === "number" ? item.order : (base.order ?? i),
    };
  });

  return {
    ...defaults,
    ...partial,
    hero: { ...defaults.hero, ...(partial.hero ?? {}) },
    seo: { ...defaults.seo, ...(partial.seo ?? {}) },
    introduction: {
      ...defaults.introduction,
      ...(partial.introduction ?? {}),
      title: definedString(
        partial.introduction?.title ?? legacyPhilosophy?.title,
        defaults.introduction.title
      ),
      content: definedString(
        partial.introduction?.content ?? legacyPhilosophy?.content,
        defaults.introduction.content
      ),
      imageSrc: definedString(
        partial.introduction?.imageSrc ?? legacyPhilosophy?.imageSrc,
        defaults.introduction.imageSrc
      ),
    },
    treatments: {
      ...defaults.treatments,
      ...(partial.treatments ?? {}),
      items: treatmentItems,
    },
    experiences: {
      ...defaults.experiences,
      ...(partial.experiences ?? {}),
      items: definedArray(partial.experiences?.items, defaults.experiences.items).map((item, i) => {
        const base = defaults.experiences.items[i] ?? defaults.experiences.items[0];
        return {
          id: item.id || base.id,
          enabled: item.enabled !== false,
          order: typeof item.order === "number" ? item.order : (base.order ?? i),
          title: definedString(item.title, base.title),
          description: definedString(item.description, base.description),
          imageSrc: definedString(item.imageSrc, base.imageSrc),
          imageAlt: definedString(item.imageAlt, base.imageAlt),
        };
      }),
    },
    packages: {
      ...defaults.packages,
      ...(partial.packages ?? {}),
      items: definedArray(partial.packages?.items, defaults.packages.items).map((item, i) => {
        const base = defaults.packages.items[i] ?? defaults.packages.items[0];
        return {
          id: item.id || base.id,
          enabled: item.enabled !== false,
          order: typeof item.order === "number" ? item.order : (base.order ?? i),
          name: definedString(item.name, base.name),
          duration: definedString(item.duration, base.duration),
          price: definedString(item.price, base.price),
          description: definedString(item.description, base.description),
          benefits: definedArray(item.benefits, base.benefits),
          imageSrc: definedString(item.imageSrc, base.imageSrc),
          imageAlt: definedString(item.imageAlt, base.imageAlt),
          ctaText: definedString(item.ctaText, base.ctaText),
        };
      }),
    },
    gallerySection: {
      ...defaults.gallerySection,
      ...(partial.gallerySection ?? {}),
    },
    gallery,
    whyChoose: {
      ...defaults.whyChoose,
      ...(partial.whyChoose ?? {}),
      items: definedArray(partial.whyChoose?.items, defaults.whyChoose.items).map((item, i) => {
        const base = defaults.whyChoose.items[i] ?? defaults.whyChoose.items[0];
        return {
          id: item.id || base.id,
          enabled: item.enabled !== false,
          order: typeof item.order === "number" ? item.order : (base.order ?? i),
          title: definedString(item.title, base.title),
          description: definedString(item.description, base.description),
          icon: definedString(item.icon, base.icon),
        };
      }),
    },
    testimonials: {
      ...defaults.testimonials,
      ...(partial.testimonials ?? {}),
      items: definedArray(partial.testimonials?.items, defaults.testimonials.items).map((item, i) => {
        const base = defaults.testimonials.items[i] ?? defaults.testimonials.items[0];
        return {
          id: item.id || base.id,
          enabled: item.enabled !== false,
          order: typeof item.order === "number" ? item.order : (base.order ?? i),
          name: definedString(item.name, base.name),
          country: definedString(item.country, base.country),
          rating: typeof item.rating === "number" ? item.rating : base.rating,
          review: definedString(item.review, base.review),
          photoSrc: definedString(item.photoSrc, base.photoSrc),
        };
      }),
    },
    booking: {
      ...defaults.booking,
      ...(partial.booking ?? {}),
      buttonHref: definedString(
        partial.booking?.buttonHref,
        defaults.booking.buttonHref
      ),
      secondaryHref: definedString(
        partial.booking?.secondaryHref,
        defaults.booking.secondaryHref
      ),
    },
    faq: {
      ...defaults.faq,
      ...(partial.faq ?? {}),
      items: definedArray(partial.faq?.items, defaults.faq.items).map((item, i) => {
        const base = defaults.faq.items[i] ?? defaults.faq.items[0];
        return {
          id: item.id || base.id,
          question: definedString(item.question, base.question),
          answer: definedString(item.answer, base.answer),
          enabled: item.enabled !== false,
          order: typeof item.order === "number" ? item.order : (base.order ?? i),
        };
      }),
    },
    cta: {
      ...defaults.cta,
      ...(partial.cta ?? {}),
      buttonHref: definedString(partial.cta?.buttonHref, defaults.cta.buttonHref),
      secondaryHref: definedString(partial.cta?.secondaryHref, defaults.cta.secondaryHref),
    },
  };
}

function mergeCulture(
  defaults: SiteContent["culture"],
  partial?: Partial<SiteContent["culture"]>
): SiteContent["culture"] {
  if (!partial) return defaults;

  const stats = definedArray(partial.stats, defaults.stats).map((stat, i) => {
    const base = defaults.stats[i] ?? defaults.stats[0];
    return {
      id: stat.id || base?.id || `cs${i + 1}`,
      value: definedString(stat.value, base.value),
      label: definedString(stat.label, base.label),
      icon: definedString(stat.icon, base.icon),
      enabled: stat.enabled !== false,
      order: typeof stat.order === "number" ? stat.order : i,
    };
  });

  const highlights = definedArray(partial.highlights, defaults.highlights).map((item, i) => {
    const base = defaults.highlights[i] ?? defaults.highlights[0];
    return {
      id: item.id || base?.id || `h${i + 1}`,
      title: definedString(item.title, base.title),
      description: definedString(item.description, base.description),
      icon: definedString(item.icon, base.icon),
      enabled: item.enabled !== false,
      order: typeof item.order === "number" ? item.order : i,
    };
  });

  return {
    ...defaults,
    ...partial,
    description: definedString(partial.description, defaults.description),
    media: {
      ...defaults.media,
      ...(partial.media ?? {}),
      imageSrc: definedString(
        partial.media?.imageSrc,
        definedString(partial.imageSrc, defaults.media.imageSrc)
      ),
      imagePublicId: definedString(
        partial.media?.imagePublicId,
        defaults.media.imagePublicId ?? ""
      ),
      videoPublicId: definedString(
        partial.media?.videoPublicId,
        defaults.media.videoPublicId ?? ""
      ),
      posterPublicId: definedString(
        partial.media?.posterPublicId,
        defaults.media.posterPublicId ?? ""
      ),
    },
    circularImage: definedString(partial.circularImage, defaults.circularImage),
    circularImageAlt: definedString(partial.circularImageAlt, defaults.circularImageAlt),
    badge: {
      ...defaults.badge,
      ...(partial.badge ?? {}),
    },
    highlightsLabel: definedString(partial.highlightsLabel, defaults.highlightsLabel),
    ctaVisible: partial.ctaVisible !== false,
    showMist: partial.showMist !== false,
    backgroundTop: definedString(partial.backgroundTop, defaults.backgroundTop),
    backgroundBottom: definedString(partial.backgroundBottom, defaults.backgroundBottom),
    goldColor: definedString(partial.goldColor, defaults.goldColor),
    headingColor: definedString(partial.headingColor, defaults.headingColor),
    bodyColor: definedString(partial.bodyColor, defaults.bodyColor),
    stats,
    imageCards: definedArray(partial.imageCards, defaults.imageCards).map((card, i) => {
      const base = defaults.imageCards[i] ?? defaults.imageCards[0];
      return {
        ...base,
        ...card,
        id: card.id || base?.id || `ic${i + 1}`,
        enabled: card.enabled !== false,
        order: typeof card.order === "number" ? card.order : i,
        label: definedString(card.label, base.label),
        title: definedString(card.title, base.title),
        description: definedString(card.description, base.description),
        href: definedString(card.href, base.href),
        media: {
          ...base.media,
          ...(card.media ?? {}),
          imageSrc: card.media?.imageSrc?.trim() || base.media.imageSrc,
        },
      };
    }),
    highlights,
    timeline: definedArray(partial.timeline, defaults.timeline),
    content: definedString(partial.content, defaults.content),
    imageSrc: definedString(
      partial.imageSrc,
      definedString(partial.media?.imageSrc, defaults.imageSrc)
    ),
  };
}

function mergeOverview(
  defaults: SiteContent["overview"],
  partial?: Partial<SiteContent["overview"]>
): SiteContent["overview"] {
  if (!partial) return defaults;

  const galleryImages = definedArray(partial.galleryImages, defaults.galleryImages);
  let slides = definedArray(partial.slider?.slides, defaults.slider.slides);

  // Migrate legacy galleryImages → slides when CMS has no slides yet
  if ((!partial.slider?.slides || partial.slider.slides.length === 0) && galleryImages.length) {
    slides = galleryImages.map((src, i) => ({
      id: `slide-${i + 1}`,
      src,
      alt: `Showcase image ${i + 1}`,
      enabled: true,
      order: i,
    }));
  }

  const defaultStat = defaults.stats[0];
  const stats = definedArray(partial.stats, defaults.stats).map((stat, i) => {
    const base = defaults.stats[i] ?? defaultStat;
    return {
      id: stat.id || base.id || `stat${i + 1}`,
      value: typeof stat.value === "number" ? stat.value : base.value,
      suffix: stat.suffix ?? base.suffix,
      label: stat.label || base.label,
      icon: stat.icon || base.icon || "crown",
      enabled: stat.enabled !== false,
      order: typeof stat.order === "number" ? stat.order : i,
      backgroundColor: stat.backgroundColor || base.backgroundColor,
      textColor: stat.textColor || base.textColor,
      borderColor: stat.borderColor || base.borderColor,
    };
  });

  return {
    ...defaults,
    ...partial,
    spacing: { ...defaults.spacing, ...(partial.spacing ?? {}) },
    slider: {
      ...defaults.slider,
      ...(partial.slider ?? {}),
      slides,
    },
    galleryImages,
    stats,
  };
}

function mergeFacilitiesSection(
  defaults: SiteContent["facilitiesSection"],
  partial?: Partial<SiteContent["facilitiesSection"]>
): SiteContent["facilitiesSection"] {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    ctaVisible: partial.ctaVisible !== false,
    showMist: partial.showMist !== false,
    media: {
      ...defaults.media,
      ...(partial.media ?? {}),
      imageSrc:
        partial.media?.imageSrc?.trim() ||
        defaults.media.imageSrc,
    },
  };
}

function mergeFineDiningSection(
  defaults: SiteContent["fineDiningSection"],
  partial?: Partial<SiteContent["fineDiningSection"]>
): SiteContent["fineDiningSection"] {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    ctaVisible: partial.ctaVisible !== false,
    showMist: partial.showMist !== false,
    media: {
      ...defaults.media,
      ...(partial.media ?? {}),
      imageSrc:
        partial.media?.imageSrc?.trim() ||
        defaults.media.imageSrc,
    },
  };
}

function mergeLobbyCafeSection(
  defaults: SiteContent["lobbyCafeSection"],
  partial?: Partial<SiteContent["lobbyCafeSection"]>
): SiteContent["lobbyCafeSection"] {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    enabled: partial.enabled !== false,
    ctaVisible: partial.ctaVisible !== false,
    showMist: partial.showMist !== false,
    media: {
      ...defaults.media,
      ...(partial.media ?? {}),
      imageSrc:
        partial.media?.imageSrc?.trim() ||
        defaults.media.imageSrc,
    },
  };
}

function mergeRooftopExperienceSection(
  defaults: SiteContent["rooftopExperienceSection"],
  partial?: Partial<SiteContent["rooftopExperienceSection"]>
): SiteContent["rooftopExperienceSection"] {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    enabled: partial.enabled !== false,
    ctaVisible: partial.ctaVisible !== false,
    showMist: partial.showMist !== false,
    media: {
      ...defaults.media,
      ...(partial.media ?? {}),
      imageSrc:
        partial.media?.imageSrc?.trim() ||
        defaults.media.imageSrc,
    },
  };
}

function mergeSpaWellnessSection(
  defaults: SiteContent["spaWellnessSection"],
  partial?: Partial<SiteContent["spaWellnessSection"]>
): SiteContent["spaWellnessSection"] {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    enabled: partial.enabled !== false,
    ctaVisible: partial.ctaVisible !== false,
    showMist: partial.showMist !== false,
    treatments: (partial.treatments ?? defaults.treatments).map((t, i) => ({
      id: t.id || defaults.treatments[i]?.id || `t${i + 1}`,
      enabled: t.enabled !== false,
      order: typeof t.order === "number" ? t.order : i,
      title: t.title || defaults.treatments[i]?.title || "",
      description: t.description ?? defaults.treatments[i]?.description ?? "",
      icon: t.icon || defaults.treatments[i]?.icon || "leaf",
    })),
    cardsGapPx:
      typeof partial.cardsGapPx === "number" ? partial.cardsGapPx : defaults.cardsGapPx,
    cardPaddingPx:
      typeof partial.cardPaddingPx === "number" ? partial.cardPaddingPx : defaults.cardPaddingPx,
    cardRadiusPx:
      typeof partial.cardRadiusPx === "number" ? partial.cardRadiusPx : defaults.cardRadiusPx,
    cardHoverLiftPx:
      typeof partial.cardHoverLiftPx === "number" ? partial.cardHoverLiftPx : defaults.cardHoverLiftPx,
    imageTopOffsetPx:
      typeof partial.imageTopOffsetPx === "number" ? partial.imageTopOffsetPx : defaults.imageTopOffsetPx,
    treatmentRoomsCard: {
      ...defaults.treatmentRoomsCard,
      ...(partial.treatmentRoomsCard ?? {}),
      enabled: partial.treatmentRoomsCard?.enabled !== false,
      widthPx:
        typeof partial.treatmentRoomsCard?.widthPx === "number"
          ? partial.treatmentRoomsCard.widthPx
          : defaults.treatmentRoomsCard.widthPx,
      heightPx:
        typeof partial.treatmentRoomsCard?.heightPx === "number"
          ? partial.treatmentRoomsCard.heightPx
          : defaults.treatmentRoomsCard.heightPx,
      leftPx:
        typeof partial.treatmentRoomsCard?.leftPx === "number"
          ? partial.treatmentRoomsCard.leftPx
          : defaults.treatmentRoomsCard.leftPx,
      bottomPx:
        typeof partial.treatmentRoomsCard?.bottomPx === "number"
          ? partial.treatmentRoomsCard.bottomPx
          : defaults.treatmentRoomsCard.bottomPx,
    },
    media: {
      ...defaults.media,
      ...(partial.media ?? {}),
      imageSrc:
        partial.media?.imageSrc?.trim() ||
        defaults.media.imageSrc,
    },
  };
}

function mergeMeetingsEventsSection(
  defaults: SiteContent["meetingsEventsSection"],
  partial?: Partial<SiteContent["meetingsEventsSection"]>
): SiteContent["meetingsEventsSection"] {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    enabled: partial.enabled !== false,
    ctaVisible: partial.ctaVisible !== false,
    showMist: partial.showMist !== false,
    stats: (partial.stats ?? defaults.stats).map((s, i) => ({
      ...(defaults.stats[i] ?? defaults.stats[0]),
      ...s,
      enabled: s.enabled !== false,
      order: typeof s.order === "number" ? s.order : i,
    })),
    checklist: (partial.checklist ?? defaults.checklist).map((c, i) => ({
      ...(defaults.checklist[i] ?? defaults.checklist[0]),
      ...c,
      enabled: c.enabled !== false,
      order: typeof c.order === "number" ? c.order : i,
    })),
    media: {
      ...defaults.media,
      ...(partial.media ?? {}),
      imageSrc: partial.media?.imageSrc?.trim() || defaults.media.imageSrc,
    },
    featuredTitle: definedString(partial.featuredTitle, defaults.featuredTitle),
    featuredDescription: definedString(
      partial.featuredDescription,
      defaults.featuredDescription
    ),
    featureCards: (partial.featureCards ?? defaults.featureCards).map((card, i) => {
      const base = defaults.featureCards[i] ?? defaults.featureCards[0];
      return {
        ...base,
        ...card,
        id: card.id || base.id,
        enabled: card.enabled !== false,
        order: typeof card.order === "number" ? card.order : i,
        media: {
          ...base.media,
          ...(card.media ?? {}),
          imageSrc: card.media?.imageSrc?.trim() || base.media.imageSrc,
        },
      };
    }),
  };
}

function mergeExploreKathmanduSection(
  defaults: SiteContent["exploreKathmanduSection"],
  partial?: Partial<SiteContent["exploreKathmanduSection"]>
): SiteContent["exploreKathmanduSection"] {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    enabled: partial.enabled !== false,
    showMist: partial.showMist !== false,
    destinations: (partial.destinations ?? defaults.destinations).map((dest, i) => {
      const base = defaults.destinations[i] ?? defaults.destinations[0];
      return {
        ...base,
        ...dest,
        id: dest.id || base.id || `dest-${i}`,
        enabled: dest.enabled !== false,
        order: typeof dest.order === "number" ? dest.order : i,
        iconSrc: dest.iconSrc ?? base.iconSrc ?? "",
        media: {
          ...base.media,
          ...(dest.media ?? {}),
          imageSrc: dest.media?.imageSrc?.trim() || base.media.imageSrc,
        },
      };
    }),
  };
}

function mergeMeetingsEventsPage(
  defaults: SiteContent["meetingsEventsPage"],
  partial?: Partial<SiteContent["meetingsEventsPage"]>
): SiteContent["meetingsEventsPage"] {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    hero: {
      ...defaults.hero,
      ...(partial.hero ?? {}),
      media: {
        ...defaults.hero.media,
        ...(partial.hero?.media ?? {}),
        imageSrc:
          partial.hero?.media?.imageSrc?.trim() ||
          partial.hero?.imageSrc?.trim() ||
          defaults.hero.media.imageSrc ||
          defaults.hero.imageSrc,
      },
      imageSrc:
        partial.hero?.imageSrc?.trim() ||
        partial.hero?.media?.imageSrc?.trim() ||
        defaults.hero.imageSrc,
    },
    seo: { ...defaults.seo, ...(partial.seo ?? {}) },
    about: {
      ...defaults.about,
      ...(partial.about ?? {}),
      media: {
        ...defaults.about.media,
        ...(partial.about?.media ?? {}),
        imageSrc:
          partial.about?.media?.imageSrc?.trim() || defaults.about.media.imageSrc,
      },
    },
    spaces: (partial.spaces ?? defaults.spaces).map((space, i) => ({
      ...(defaults.spaces[i] ?? defaults.spaces[0]),
      ...space,
      enabled: space.enabled !== false,
      order: typeof space.order === "number" ? space.order : i,
      features: definedArray(space.features, defaults.spaces[i]?.features ?? []),
      media: {
        ...(defaults.spaces[i]?.media ?? defaults.spaces[0].media),
        ...(space.media ?? {}),
        imageSrc:
          space.media?.imageSrc?.trim() ||
          defaults.spaces[i]?.media.imageSrc ||
          defaults.spaces[0].media.imageSrc,
      },
    })),
    facilities: (partial.facilities ?? defaults.facilities).map((f, i) => ({
      ...(defaults.facilities[i] ?? defaults.facilities[0]),
      ...f,
      enabled: f.enabled !== false,
      order: typeof f.order === "number" ? f.order : i,
    })),
    gallery: (partial.gallery ?? defaults.gallery).map((g, i) => ({
      ...(defaults.gallery[i] ?? defaults.gallery[0]),
      ...g,
      enabled: g.enabled !== false,
      order: typeof g.order === "number" ? g.order : i,
    })),
    whyChooseUs: (partial.whyChooseUs ?? defaults.whyChooseUs).map((w, i) => ({
      ...(defaults.whyChooseUs[i] ?? defaults.whyChooseUs[0]),
      ...w,
      enabled: w.enabled !== false,
      order: typeof w.order === "number" ? w.order : i,
    })),
    faq: (partial.faq ?? defaults.faq).map((item, i) => ({
      ...(defaults.faq[i] ?? defaults.faq[0]),
      ...item,
      enabled: item.enabled !== false,
      order: typeof item.order === "number" ? item.order : i,
    })),
    form: { ...defaults.form, ...(partial.form ?? {}) },
  };
}

function mergeCulturalExperiencePage(
  defaults: SiteContent["culturalExperiencePage"],
  partial?: Partial<SiteContent["culturalExperiencePage"]>
): SiteContent["culturalExperiencePage"] {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    hero: {
      ...defaults.hero,
      ...(partial.hero ?? {}),
      media: { ...defaults.hero.media, ...(partial.hero?.media ?? {}) },
    },
    seo: { ...defaults.seo, ...(partial.seo ?? {}) },
    story: { ...defaults.story, ...(partial.story ?? {}) },
    gallery: definedArray(partial.gallery, defaults.gallery),
    timeline: definedArray(partial.timeline, defaults.timeline),
    experienceCards: definedArray(partial.experienceCards, defaults.experienceCards),
    faq: definedArray(partial.faq, defaults.faq),
  };
}

function mergeGallerySection(
  defaults: SiteContent["gallerySection"],
  partial?: Partial<SiteContent["gallerySection"]>
): SiteContent["gallerySection"] {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    enabled: partial.enabled !== false,
    ctaVisible: partial.ctaVisible !== false,
    showMist: partial.showMist !== false,
    homeImageLimit:
      typeof partial.homeImageLimit === "number"
        ? partial.homeImageLimit
        : defaults.homeImageLimit,
  };
}

function mergeArticlesHomeSection(
  defaults: SiteContent["articlesHomeSection"],
  partial?: Partial<SiteContent["articlesHomeSection"]>
): SiteContent["articlesHomeSection"] {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    enabled: partial.enabled !== false,
    autoSlide: partial.autoSlide !== false,
    showAuthor: partial.showAuthor !== false,
    showReadingTime: partial.showReadingTime !== false,
    showDate: partial.showDate !== false,
    showCategory: partial.showCategory !== false,
    showExcerpt: partial.showExcerpt !== false,
    articleLimit:
      typeof partial.articleLimit === "number" ? partial.articleLimit : defaults.articleLimit,
    slideIntervalMs:
      typeof partial.slideIntervalMs === "number"
        ? partial.slideIntervalMs
        : defaults.slideIntervalMs,
    transitionSpeedMs:
      typeof partial.transitionSpeedMs === "number"
        ? partial.transitionSpeedMs
        : defaults.transitionSpeedMs,
    sectionPaddingY:
      typeof partial.sectionPaddingY === "number"
        ? partial.sectionPaddingY
        : defaults.sectionPaddingY,
    cardGapPx:
      typeof partial.cardGapPx === "number" ? partial.cardGapPx : defaults.cardGapPx,
    cardRadiusPx:
      typeof partial.cardRadiusPx === "number" ? partial.cardRadiusPx : defaults.cardRadiusPx,
  };
}

function mergeGalleryPage(
  defaults: SiteContent["galleryPage"],
  partial?: Partial<SiteContent["galleryPage"]>
): SiteContent["galleryPage"] {
  if (!partial) return defaults;
  const heroPartial = partial.hero as Partial<SiteContent["galleryPage"]["hero"]> | undefined;
  const isLegacyHero =
    Boolean(heroPartial) &&
    !("breadcrumbHome" in (heroPartial || {})) &&
    (heroPartial?.title === "Gallery" || heroPartial?.subtitle === "Visual Journey");

  return {
    ...defaults,
    ...partial,
    hero: isLegacyHero
      ? defaults.hero
      : {
          ...defaults.hero,
          ...(heroPartial ?? {}),
          media: {
            ...defaults.hero.media,
            ...(heroPartial?.media ?? {}),
            imageSrc:
              heroPartial?.media?.imageSrc?.trim() ||
              heroPartial?.imageSrc?.trim() ||
              defaults.hero.media.imageSrc ||
              defaults.hero.imageSrc,
          },
          imageSrc:
            heroPartial?.imageSrc?.trim() ||
            heroPartial?.media?.imageSrc?.trim() ||
            defaults.hero.imageSrc,
          breadcrumbHome: heroPartial?.breadcrumbHome ?? defaults.hero.breadcrumbHome,
          breadcrumbCurrent: heroPartial?.breadcrumbCurrent ?? defaults.hero.breadcrumbCurrent,
          overlayOpacity:
            heroPartial?.overlayOpacity != null
              ? Number(heroPartial.overlayOpacity) || defaults.hero.overlayOpacity
              : defaults.hero.overlayOpacity,
        },
    seo: { ...defaults.seo, ...(partial.seo ?? {}) },
    showFilters: partial.showFilters !== false,
    gridColumns: (partial.gridColumns ?? defaults.gridColumns) as 2 | 3 | 4,
    initialVisible: partial.initialVisible ?? defaults.initialVisible,
    loadMoreCount: partial.loadMoreCount ?? defaults.loadMoreCount,
    featured: { ...defaults.featured, ...(partial.featured ?? {}) },
    videos: { ...defaults.videos, ...(partial.videos ?? {}) },
    strip: { ...defaults.strip, ...(partial.strip ?? {}) },
    cta: { ...defaults.cta, ...(partial.cta ?? {}) },
  };
}

function mergeAboutPage(
  defaults: SiteContent["aboutPage"],
  partial?: Partial<SiteContent["aboutPage"]> & {
    history?: { title: string; content: string };
    mission?: { title: string; content: string };
    vision?: { title: string; content: string };
    facilities?: Array<{ name: string; description: string; icon: string }>;
    timeline?: Array<{ year: string; title: string; description: string }>;
  }
): SiteContent["aboutPage"] {
  if (!partial) return defaults;

  const legacyHistory = partial.history;
  const legacyMission = partial.mission;
  const legacyVision = partial.vision;
  const legacyTimeline = partial.timeline;
  const heroPartial = partial.hero as Partial<SiteContent["aboutPage"]["hero"]> | undefined;
  const isLegacyHero =
    Boolean(heroPartial) &&
    !("breadcrumbHome" in (heroPartial || {})) &&
    (heroPartial?.title === "Our Story" || heroPartial?.subtitle === "About");

  return {
    ...defaults,
    ...partial,
    hero: isLegacyHero
      ? defaults.hero
      : {
          ...defaults.hero,
          ...(heroPartial ?? {}),
          breadcrumbHome: heroPartial?.breadcrumbHome ?? defaults.hero.breadcrumbHome,
          breadcrumbCurrent:
            heroPartial?.breadcrumbCurrent ?? defaults.hero.breadcrumbCurrent,
          overlayOpacity:
            heroPartial?.overlayOpacity != null
              ? Number(heroPartial.overlayOpacity) || defaults.hero.overlayOpacity
              : defaults.hero.overlayOpacity,
        },
    story: {
      ...defaults.story,
      ...(partial.story ?? {}),
      ...(legacyHistory && !partial.story
        ? { title: legacyHistory.title, content: legacyHistory.content }
        : {}),
    },
    stats: definedArray(partial.stats, defaults.stats),
    philosophy: {
      ...defaults.philosophy,
      ...(partial.philosophy ?? {}),
      mission: {
        ...defaults.philosophy.mission,
        ...(partial.philosophy?.mission ?? {}),
        ...(legacyMission && !partial.philosophy?.mission
          ? { title: legacyMission.title, content: legacyMission.content }
          : {}),
      },
      vision: {
        ...defaults.philosophy.vision,
        ...(partial.philosophy?.vision ?? {}),
        ...(legacyVision && !partial.philosophy?.vision
          ? { title: legacyVision.title, content: legacyVision.content }
          : {}),
      },
      values: definedArray(partial.philosophy?.values, defaults.philosophy.values),
    },
    whyChoose: {
      ...defaults.whyChoose,
      ...(partial.whyChoose ?? {}),
      items: definedArray(partial.whyChoose?.items, defaults.whyChoose.items),
    },
    discover: {
      ...defaults.discover,
      ...(partial.discover ?? {}),
      images: definedArray(partial.discover?.images, defaults.discover.images),
    },
    services: {
      ...defaults.services,
      ...(partial.services ?? {}),
      items: definedArray(partial.services?.items, defaults.services.items),
    },
    team: {
      ...defaults.team,
      ...(partial.team ?? {}),
      members: definedArray(partial.team?.members, defaults.team.members),
    },
    awards: {
      ...defaults.awards,
      ...(partial.awards ?? {}),
      items:
        partial.awards?.items ??
        (legacyTimeline?.length
          ? legacyTimeline.map((t, i) => ({
              id: `legacy-${i}`,
              enabled: true,
              order: i + 1,
              year: t.year,
              title: t.title,
              description: t.description,
            }))
          : defaults.awards.items),
    },
    testimonials: {
      ...defaults.testimonials,
      ...(partial.testimonials ?? {}),
      items: definedArray(partial.testimonials?.items, defaults.testimonials.items),
    },
    galleryPreview: {
      ...defaults.galleryPreview,
      ...(partial.galleryPreview ?? {}),
      images: definedArray(partial.galleryPreview?.images, defaults.galleryPreview.images),
    },
    cta: { ...defaults.cta, ...(partial.cta ?? {}) },
    seo: { ...defaults.seo, ...(partial.seo ?? {}) },
  };
}

function mergeContactPage(
  partial?: Partial<SiteContent["contactPage"]>
): SiteContent["contactPage"] {
  const defaults = defaultContent.contactPage;
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    hero: { ...defaults.hero, ...(partial.hero ?? {}) },
    cards: definedArray(partial.cards, defaults.cards),
    form: {
      ...defaults.form,
      ...(partial.form ?? {}),
      bookingTypes: definedArray(partial.form?.bookingTypes, defaults.form.bookingTypes),
    },
    whyContact: {
      ...defaults.whyContact,
      ...(partial.whyContact ?? {}),
      items: definedArray(partial.whyContact?.items, defaults.whyContact.items),
    },
    location: {
      ...defaults.location,
      ...(partial.location ?? {}),
      nearby: definedArray(partial.location?.nearby, defaults.location.nearby),
    },
    business: {
      ...defaults.business,
      ...(partial.business ?? {}),
      left: definedArray(partial.business?.left, defaults.business.left),
      right: definedArray(partial.business?.right, defaults.business.right),
    },
    faq: {
      ...defaults.faq,
      ...(partial.faq ?? {}),
      items: definedArray(partial.faq?.items, defaults.faq.items),
    },
    cta: { ...defaults.cta, ...(partial.cta ?? {}) },
    seo: { ...defaults.seo, ...(partial.seo ?? {}) },
  };
}
