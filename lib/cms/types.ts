import type { HeroBuilderSettings } from "./hero-builder-types";

export interface NavItem {
  label: string;
  href: string;
}

export interface HeroButton {
  text: string;
  href: string;
  visible: boolean;
}

export type { HeroBuilderSettings } from "./hero-builder-types";

export interface PageHero {
  title: string;
  subtitle: string;
  description: string;
  imageSrc: string;
}

export interface PageSeo {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

export interface SectionToggle {
  enabled: boolean;
  order: number;
}

export interface HomeSectionMeta extends SectionToggle {
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export interface ThemeSettings {
  primary: string;
  secondary: string;
  accent: string;
  champagne: string;
  background: string;
  borderRadius: string;
  fontDisplay: string;
  fontBody: string;
  animationSpeed: "slow" | "normal" | "fast";
  headerStyle: "glass" | "solid" | "transparent";
  footerStyle: "cream" | "gradient" | "champagne";
}

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  publicId?: string;
  folder: string;
  mimeType: string;
  size: number;
  createdAt: string;
  /** Display title in the media library */
  title?: string;
  alt?: string;
  /** Gallery | Rooms | Spa | Dining | Culture | General | Hero | Blog | Other */
  category?: string;
}

export interface CmsMedia {
  type: "image" | "video";
  imageSrc: string;
  imagePublicId?: string;
  videoSrc: string;
  videoPublicId?: string;
  poster: string;
  posterPublicId?: string;
  alt: string;
  caption?: string;
}

export interface CultureHighlight {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled?: boolean;
  order?: number;
}

export interface CultureStat {
  id?: string;
  value: string;
  label: string;
  icon: string;
  enabled?: boolean;
  order?: number;
}

export interface CultureBadge {
  enabled: boolean;
  number: string;
  emphasis: string;
  description: string;
  iconSrc: string;
}

export interface CultureTimelineItem {
  year: string;
  title: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SiteContent {
  hotel: {
    name: string;
    tagline: string;
    description: string;
    location: string;
    address: string;
    phone: string;
    email: string;
    social: {
      facebook: string;
      instagram: string;
      twitter: string;
      tripadvisor: string;
    };
  };
  header: {
    useLogo: boolean;
    showText: boolean;
    hideText: boolean;
    headerText: string;
    logoSrc: string;
    logoSize: number;
    height: number;
    sticky: boolean;
    transparent: boolean;
    backgroundColor: string;
    textColor: string;
    showStars: boolean;
    phone: string;
    showPhone: boolean;
    bookButtonText: string;
    menuItems: NavItem[];
    overlayMenuItems: NavItem[];
  };
  hero: HeroBuilderSettings;
  homeSections: {
    hero: SectionToggle;
    welcome: HomeSectionMeta;
    aboutPreview: HomeSectionMeta;
    rooms: HomeSectionMeta;
    facilities: HomeSectionMeta;
    dining: HomeSectionMeta;
    spa: HomeSectionMeta;
    gallery: HomeSectionMeta;
    testimonials: HomeSectionMeta;
    cta: HomeSectionMeta;
  };
  overview: {
    eyebrow: string;
    title: string;
    content: string;
    backgroundTop: string;
    backgroundBottom: string;
    headingColor: string;
    bodyColor: string;
    goldColor: string;
    spacing: {
      sectionPaddingY: number;
      sliderMaxHeight: number;
    };
    slider: {
      autoPlay: boolean;
      loop: boolean;
      slideDurationMs: number;
      transitionSpeedMs: number;
      showArrows: boolean;
      showDots: boolean;
      maxImages: number;
      slides: Array<{
        id: string;
        src: string;
        alt: string;
        enabled: boolean;
        order: number;
      }>;
    };
    /** Legacy gallery URLs — migrated into slider.slides when slides empty */
    galleryImages: string[];
    stats: Array<{
      id: string;
      value: number;
      suffix: string;
      label: string;
      icon: string;
      enabled: boolean;
      order: number;
      backgroundColor: string;
      textColor: string;
      borderColor: string;
    }>;
  };
  experiences: Array<{
    id: string;
    title: string;
    content: string;
    imageSrc: string;
    imagePosition: "left" | "right";
    variant: "dining" | "cafe" | "lounge" | "spa";
  }>;
  locationAdvantages: Array<{
    id: string;
    title: string;
    distance: string;
    icon: string;
  }>;
  culture: {
    eyebrow: string;
    title: string;
    /** Short homepage description (premium heritage section) */
    description: string;
    content: string;
    imageSrc: string;
    media: CmsMedia;
    circularImage: string;
    circularImageAlt: string;
    badge: CultureBadge;
    quote: string;
    quoteAuthor: string;
    highlightsLabel: string;
    ctaText: string;
    ctaHref: string;
    ctaVisible: boolean;
    backgroundTop: string;
    backgroundBottom: string;
    goldColor: string;
    headingColor: string;
    bodyColor: string;
    showMist: boolean;
    stats: CultureStat[];
    highlights: CultureHighlight[];
    timeline: CultureTimelineItem[];
  };
  facilitiesSection: {
    eyebrow: string;
    title: string;
    description: string;
    caption: string;
    media: CmsMedia;
  };
  culturalExperiencePage: {
    hero: PageHero & { media: CmsMedia };
    seo: PageSeo;
    story: { title: string; content: string };
    gallery: Array<{ id: string; src: string; title: string; alt: string }>;
    timeline: CultureTimelineItem[];
    experienceCards: CultureHighlight[];
    faq: FaqItem[];
  };
  facilities: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
  rooms: Array<{
    id: string;
    name: string;
    price: number;
    guests: string;
    maxGuests?: number;
    size: string;
    bedType: string;
    features: string[];
    description: string;
    longDescription: string;
    imageSrc: string;
    gallery: string[];
    amenities: string[];
    policies: string[];
    available?: boolean;
    /** Homepage Accommodations section visibility */
    visible?: boolean;
    order?: number;
    exploreText?: string;
    breakfastPrice?: number;
  }>;
  roomBooking: {
    submitLabel: string;
    payOnlineLabel: string;
    payAtHotelLabel: string;
    specialRequestLabel: string;
    availabilityNote: string;
    breakfastRoomOnlyLabel?: string;
    breakfastWithLabel?: string;
    breakfastNote?: string;
    confirmationTitle?: string;
    confirmationMessage?: string;
  };
  roomsSection: {
    eyebrow: string;
    title: string;
    description: string;
    ctaText: string;
    ctaHref: string;
    ctaVisible: boolean;
    showMist: boolean;
    backgroundTop: string;
    backgroundBottom: string;
    goldColor: string;
    headingColor: string;
    bodyColor: string;
  };
  diningPage: {
    hero: PageHero;
    seo: PageSeo;
    intro: { title: string; content: string };
    venues: Array<{
      id: string;
      name: string;
      tagline: string;
      description: string;
      features: string[];
      imageSrc: string;
    }>;
    highlights: Array<{ title: string; description: string }>;
    gallery: Array<{ id: string; src: string; title: string }>;
    cta: { title: string; description: string; buttonText: string };
  };
  spaPage: {
    hero: PageHero;
    seo: PageSeo;
    philosophy: { title: string; content: string; imageSrc: string };
    services: Array<{ id: string; name: string; description: string }>;
    gallery: Array<{ id: string; src: string; title: string }>;
    cta: { title: string; description: string; buttonText: string };
  };
  aboutPage: {
    hero: PageHero;
    seo: PageSeo;
    history: { title: string; content: string };
    mission: { title: string; content: string };
    vision: { title: string; content: string };
    facilities: Array<{ name: string; description: string; icon: string }>;
    timeline: Array<{ year: string; title: string; description: string }>;
  };
  reviews: Array<{
    id: string;
    name: string;
    country: string;
    rating: number;
    review: string;
  }>;
  gallery: Array<{
    id: string;
    src: string;
    title: string;
    category: string;
    type: "image" | "video";
    alt?: string;
    active?: boolean;
    order?: number;
  }>;
  gallerySection: {
    eyebrow: string;
    title: string;
    description: string;
  };
  galleryPage: {
    seo: PageSeo;
  };
  roomsPage: {
    seo: PageSeo;
  };
  contactPage: {
    seo: PageSeo;
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    frontDesk: string;
    mapEmbedUrl: string;
    workingHours: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    favicon: string;
    googleAnalytics: string;
    googleTagManager: string;
    robotsAllow: boolean;
  };
  theme: ThemeSettings;
  settings: {
    bookingEmail: string;
  };
  footer: {
    logoSrc: string;
    brandName: string;
    description: string;
    tagline: string;
    quickLinks: NavItem[];
    contact: {
      phone: string;
      email: string;
      location: string;
      frontDesk: string;
    };
    newsletter: {
      heading: string;
      description: string;
      buttonText: string;
      placeholder: string;
    };
    newsletterText: string;
    galleryPreview: Array<{ id: string; src: string; alt: string }>;
    showPayments: boolean;
    paymentLabel: string;
    /** Legacy toggle keys — kept for merge compatibility */
    enabledPayments: string[];
    /** Six Orbit-uploadable payment badge images (image only, no labels) */
    paymentLogos: Array<{ id: string; src: string }>;
    copyrightText: string;
    developerLabel: string;
    developerUrl: string;
    social: {
      facebook: string;
      instagram: string;
      tripadvisor: string;
      googleReviews: string;
      facebookIcon: string;
      instagramIcon: string;
      tripadvisorIcon: string;
      googleReviewsIcon: string;
    };
    colors: {
      topBackground: string;
      bottomBackground: string;
      gold: string;
      text: string;
    };
    spacing: {
      sectionPaddingY: number;
    };
  };
  mediaLibrary: MediaAsset[];
}

export type HomeSectionKey = keyof SiteContent["homeSections"];
