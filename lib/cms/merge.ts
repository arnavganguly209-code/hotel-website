import type { SiteContent } from "./types";
import { defaultContent } from "./default-content";
import { enrichRoom } from "./room-helpers";

export function mergeWithDefaults(partial: Partial<SiteContent>): SiteContent {
  return {
    hotel: { ...defaultContent.hotel, ...partial.hotel },
    header: {
      ...defaultContent.header,
      ...partial.header,
      menuItems: partial.header?.menuItems?.length
        ? partial.header.menuItems
        : defaultContent.header.menuItems,
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
      gallery: { ...defaultContent.homeSections.gallery, ...partial.homeSections?.gallery },
      testimonials: { ...defaultContent.homeSections.testimonials, ...partial.homeSections?.testimonials },
      cta: { ...defaultContent.homeSections.cta, ...partial.homeSections?.cta },
    },
    overview: {
      ...defaultContent.overview,
      ...partial.overview,
      stats: partial.overview?.stats?.length ? partial.overview.stats : defaultContent.overview.stats,
      galleryImages: partial.overview?.galleryImages?.length
        ? partial.overview.galleryImages
        : defaultContent.overview.galleryImages,
    },
    roomsSection: { ...defaultContent.roomsSection, ...(partial.roomsSection ?? {}) },
    experiences: partial.experiences?.length ? partial.experiences : defaultContent.experiences,
    locationAdvantages: partial.locationAdvantages?.length
      ? partial.locationAdvantages
      : defaultContent.locationAdvantages,
    culture: mergeCulture(defaultContent.culture, partial.culture),
    facilitiesSection: mergeFacilitiesSection(defaultContent.facilitiesSection, partial.facilitiesSection),
    culturalExperiencePage: mergeCulturalExperiencePage(
      defaultContent.culturalExperiencePage,
      partial.culturalExperiencePage
    ),
    facilities: partial.facilities?.length
      ? partial.facilities.map((f, i) => ({
          ...defaultContent.facilities[i],
          ...f,
          description: f.description ?? defaultContent.facilities[i]?.description ?? "",
        }))
      : defaultContent.facilities,
    rooms: partial.rooms?.length
      ? partial.rooms.map((room, i) =>
          enrichRoom(defaultContent.rooms[i] ?? defaultContent.rooms[0], room)
        )
      : defaultContent.rooms,
    roomBooking: { ...defaultContent.roomBooking, ...(partial.roomBooking ?? {}) },
    diningPage: mergePageSection(defaultContent.diningPage, partial.diningPage),
    spaPage: mergePageSection(defaultContent.spaPage, partial.spaPage),
    aboutPage: mergeAboutPage(defaultContent.aboutPage, partial.aboutPage),
    reviews: partial.reviews?.length ? partial.reviews : defaultContent.reviews,
    gallery: partial.gallery?.length
      ? partial.gallery.map((item, i) => ({
          ...(defaultContent.gallery[i] ?? defaultContent.gallery[0]),
          ...item,
          type: item.type ?? "image",
        }))
      : defaultContent.gallery,
    gallerySection: { ...defaultContent.gallerySection, ...(partial.gallerySection ?? {}) },
    galleryPage: { ...defaultContent.galleryPage, ...(partial.galleryPage ?? {}) },
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
      social: { ...defaultContent.footer.social, ...(partial.footer?.social ?? {}) },
      colors: { ...defaultContent.footer.colors, ...(partial.footer?.colors ?? {}) },
      spacing: { ...defaultContent.footer.spacing, ...(partial.footer?.spacing ?? {}) },
      quickLinks: partial.footer?.quickLinks?.length
        ? partial.footer.quickLinks
        : defaultContent.footer.quickLinks,
      galleryPreview: partial.footer?.galleryPreview?.length
        ? partial.footer.galleryPreview
        : defaultContent.footer.galleryPreview,
      enabledPayments: partial.footer?.enabledPayments?.length
        ? partial.footer.enabledPayments
        : defaultContent.footer.enabledPayments,
    },
    mediaLibrary: partial.mediaLibrary?.length ? partial.mediaLibrary : defaultContent.mediaLibrary,
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
  return {
    ...defaults,
    ...partial,
    media: {
      ...defaults.media,
      ...(partial.media ?? {}),
      imageSrc:
        partial.media?.imageSrc || partial.imageSrc || defaults.media.imageSrc,
    },
    stats: partial.stats?.length ? partial.stats : defaults.stats,
    highlights: partial.highlights?.length ? partial.highlights : defaults.highlights,
    timeline: partial.timeline?.length ? partial.timeline : defaults.timeline,
    content: partial.content || defaults.content,
    imageSrc: partial.imageSrc ?? partial.media?.imageSrc ?? defaults.imageSrc,
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
    media: { ...defaults.media, ...(partial.media ?? {}) },
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
    gallery: partial.gallery?.length ? partial.gallery : defaults.gallery,
    timeline: partial.timeline?.length ? partial.timeline : defaults.timeline,
    experienceCards: partial.experienceCards?.length
      ? partial.experienceCards
      : defaults.experienceCards,
    faq: partial.faq?.length ? partial.faq : defaults.faq,
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
    facilities: partial.facilities?.length ? partial.facilities : defaults.facilities,
    timeline: partial.timeline?.length ? partial.timeline : defaults.timeline,
  };
}
