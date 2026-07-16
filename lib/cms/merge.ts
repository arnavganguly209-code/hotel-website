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
      menuItems: ensureMeetingsNavItem(
        definedArray(partial.header?.menuItems, defaultContent.header.menuItems)
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
      gallery: { ...defaultContent.homeSections.gallery, ...partial.homeSections?.gallery },
      testimonials: { ...defaultContent.homeSections.testimonials, ...partial.homeSections?.testimonials },
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
    diningPage: mergePageSection(defaultContent.diningPage, partial.diningPage),
    spaPage: mergePageSection(defaultContent.spaPage, partial.spaPage),
    meetingsEventsPage: mergeMeetingsEventsPage(
      defaultContent.meetingsEventsPage,
      partial.meetingsEventsPage
    ),
    aboutPage: mergeAboutPage(defaultContent.aboutPage, partial.aboutPage),
    reviews: definedArray(partial.reviews, defaultContent.reviews),
    gallery: definedArray(partial.gallery, defaultContent.gallery).map((item, i) => ({
      ...(defaultContent.gallery[i] ?? defaultContent.gallery[0]),
      ...item,
      type: item.type ?? "image",
      description: item.description ?? defaultContent.gallery[i]?.description ?? "",
      alt: item.alt ?? item.title ?? "",
      active: item.active !== false,
      showOnHome: item.showOnHome !== false,
      order: item.order ?? i,
    })),
    galleryCategories: definedArray(
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
    })),
    gallerySection: mergeGallerySection(
      defaultContent.gallerySection,
      partial.gallerySection
    ),
    galleryPage: mergeGalleryPage(defaultContent.galleryPage, partial.galleryPage),
    roomsPage: { ...defaultContent.roomsPage, ...(partial.roomsPage ?? {}) },
    contactPage: { ...defaultContent.contactPage, ...(partial.contactPage ?? {}) },
    contact: { ...defaultContent.contact, ...(partial.contact ?? {}) },
    seo: { ...defaultContent.seo, ...partial.seo },
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
    },
    mediaLibrary: definedArray(partial.mediaLibrary, defaultContent.mediaLibrary),
  };
}

function mergeHero(
  defaults: SiteContent["hero"],
  partial?: Partial<SiteContent["hero"]>
): SiteContent["hero"] {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    colors: { ...defaults.colors, ...partial.colors },
    image: { ...defaults.image, ...partial.image },
    logo: { ...defaults.logo, ...partial.logo },
    titleStyle: { ...defaults.titleStyle, ...partial.titleStyle },
    subtitleStyle: { ...defaults.subtitleStyle, ...partial.subtitleStyle },
    descriptionStyle: { ...defaults.descriptionStyle, ...partial.descriptionStyle },
    welcomeStyle: { ...defaults.welcomeStyle, ...partial.welcomeStyle },
    primaryButton: { ...defaults.primaryButton, ...partial.primaryButton },
    secondaryButton: { ...defaults.secondaryButton, ...partial.secondaryButton },
    bookingBar: {
      ...defaults.bookingBar,
      ...partial.bookingBar,
      fields: { ...defaults.bookingBar.fields, ...partial.bookingBar?.fields },
      colors: { ...defaults.bookingBar.colors, ...partial.bookingBar?.colors },
      labels: { ...defaults.bookingBar.labels, ...partial.bookingBar?.labels },
      icons: { ...defaults.bookingBar.icons, ...partial.bookingBar?.icons },
      animations: { ...defaults.bookingBar.animations, ...partial.bookingBar?.animations },
      responsive: { ...defaults.bookingBar.responsive, ...partial.bookingBar?.responsive },
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

function mergeGalleryPage(
  defaults: SiteContent["galleryPage"],
  partial?: Partial<SiteContent["galleryPage"]>
): SiteContent["galleryPage"] {
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
    showFilters: partial.showFilters !== false,
    gridColumns: (partial.gridColumns ?? defaults.gridColumns) as 2 | 3 | 4,
  };
}

function mergeAboutPage(
  defaults: SiteContent["aboutPage"],
  partial?: Partial<SiteContent["aboutPage"]>
): SiteContent["aboutPage"] {
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    hero: { ...defaults.hero, ...(partial.hero ?? {}) },
    seo: { ...defaults.seo, ...(partial.seo ?? {}) },
    history: { ...defaults.history, ...(partial.history ?? {}) },
    mission: { ...defaults.mission, ...(partial.mission ?? {}) },
    vision: { ...defaults.vision, ...(partial.vision ?? {}) },
    facilities: definedArray(partial.facilities, defaults.facilities),
    timeline: definedArray(partial.timeline, defaults.timeline),
  };
}
