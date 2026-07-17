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

export interface CultureImageCard {
  id: string;
  enabled: boolean;
  order: number;
  label: string;
  title: string;
  description: string;
  href: string;
  media: CmsMedia;
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
    meetingsEvents: HomeSectionMeta;
    exploreKathmandu: HomeSectionMeta;
    gallery: HomeSectionMeta;
    testimonials: HomeSectionMeta;
    articles: HomeSectionMeta;
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
    /** Premium image cards row below statistics */
    imageCards: CultureImageCard[];
    highlights: CultureHighlight[];
    timeline: CultureTimelineItem[];
  };
  facilitiesSection: {
    eyebrow: string;
    title: string;
    description: string;
    caption: string;
    media: CmsMedia;
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
  fineDiningSection: {
    eyebrow: string;
    title: string;
    description: string;
    media: CmsMedia;
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
  lobbyCafeSection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    description: string;
    media: CmsMedia;
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
  rooftopExperienceSection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    description: string;
    media: CmsMedia;
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
  spaWellnessSection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    description: string;
    media: CmsMedia;
    treatments: Array<{
      id: string;
      enabled: boolean;
      order: number;
      title: string;
      description: string;
      /** Lucide-react icon name key */
      icon: string;
    }>;
    ctaText: string;
    ctaHref: string;
    ctaVisible: boolean;
    showMist: boolean;
    backgroundTop: string;
    backgroundBottom: string;
    goldColor: string;
    headingColor: string;
    bodyColor: string;
    cardsGapPx: number;
    cardPaddingPx: number;
    cardRadiusPx: number;
    cardHoverLiftPx: number;
    imageTopOffsetPx: number;
    treatmentRoomsCard: {
      enabled: boolean;
      number: string;
      label: string;
      backgroundColor: string;
      textColor: string;
      borderColor: string;
      shadow: string;
      accentColor: string;
      widthPx: number;
      heightPx: number;
      leftPx: number;
      bottomPx: number;
    };
  };
  meetingsEventsSection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    description: string;
    /** Large hero image on the left column */
    media: CmsMedia;
    featuredTitle: string;
    featuredDescription: string;
    /** Three small cards under the large image */
    featureCards: Array<{
      id: string;
      enabled: boolean;
      order: number;
      title: string;
      description: string;
      /** Lucide icon key: users | rings | cloche */
      icon: string;
      media: CmsMedia;
    }>;
    statsEyebrow: string;
    stats: Array<{
      id: string;
      value: string;
      label: string;
      enabled: boolean;
      order: number;
    }>;
    checklist: Array<{
      id: string;
      text: string;
      enabled: boolean;
      order: number;
    }>;
    cardBackgroundColor: string;
    cardBorderColor: string;
    ctaText: string;
    ctaHref: string;
    ctaVisible: boolean;
    showMist: boolean;
    backgroundTop: string;
    backgroundBottom: string;
    goldColor: string;
    headingColor: string;
    bodyColor: string;
    sectionPaddingY: number;
  };
  exploreKathmanduSection: {
    enabled: boolean;
    eyebrow: string;
    titlePrimary: string;
    titleAccent: string;
    description: string;
    destinations: Array<{
      id: string;
      enabled: boolean;
      order: number;
      category: string;
      title: string;
      description: string;
      distance: string;
      href: string;
      /** Lucide / preset icon key */
      icon: string;
      /** Optional uploaded icon image (SVG/PNG) — overrides Lucide when set */
      iconSrc: string;
      media: CmsMedia;
    }>;
    showMist: boolean;
    backgroundTop: string;
    backgroundBottom: string;
    goldColor: string;
    headingColor: string;
    bodyColor: string;
    cardBackgroundColor: string;
    cardBorderColor: string;
    sectionPaddingY: number;
    cardsGapPx: number;
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
    /** Optional custom uploaded icon image — overrides Lucide icon when set */
    iconSrc?: string;
    enabled?: boolean;
    order?: number;
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
    hero: PageHero & {
      breadcrumbHome: string;
      breadcrumbCurrent: string;
      overlayOpacity: number;
      scrollHint: string;
    };
    seo: PageSeo & { keywords: string };
    welcome: {
      eyebrow: string;
      title: string;
      content: string;
      quote: string;
      quoteAuthor: string;
      imageSrc: string;
      imageAlt: string;
    };
    destinations: {
      eyebrow: string;
      title: string;
      description: string;
    };
    venues: Array<{
      id: string;
      enabled: boolean;
      order: number;
      name: string;
      tagline: string;
      description: string;
      cuisine: string;
      hours: string;
      capacity: string;
      signaturesLabel: string;
      signatures: string[];
      features: string[];
      imageSrc: string;
      imageAlt: string;
      ctaText: string;
      ctaHref: string;
    }>;
    menu: {
      eyebrow: string;
      title: string;
      description: string;
      categories: Array<{
        id: string;
        name: string;
        enabled: boolean;
        order: number;
        items: Array<{
          id: string;
          enabled: boolean;
          order: number;
          title: string;
          description: string;
          price: string;
          imageSrc: string;
          imageAlt: string;
          chefRecommended: boolean;
        }>;
      }>;
    };
    chefRecommendation: {
      enabled: boolean;
      eyebrow: string;
      title: string;
      description: string;
      dishes: Array<{
        id: string;
        enabled: boolean;
        order: number;
        title: string;
        description: string;
        price: string;
        imageSrc: string;
        imageAlt: string;
      }>;
    };
    form: {
      title: string;
      description: string;
      submitLabel: string;
      successTitle: string;
      successMessage: string;
      successSecondary: string;
      restaurantOptions: string[];
      occasionOptions: string[];
      consentLabel: string;
    };
    gallerySection: {
      eyebrow: string;
      title: string;
      description: string;
    };
    gallery: Array<{
      id: string;
      src: string;
      title: string;
      alt: string;
      enabled: boolean;
      order: number;
    }>;
    reviews: {
      eyebrow: string;
      title: string;
      description: string;
      items: Array<{
        id: string;
        enabled: boolean;
        order: number;
        name: string;
        country: string;
        rating: number;
        review: string;
        photoSrc: string;
      }>;
    };
    faq: {
      eyebrow: string;
      title: string;
      description: string;
      items: Array<{
        id: string;
        question: string;
        answer: string;
        enabled: boolean;
        order: number;
      }>;
    };
    cta: {
      title: string;
      description: string;
      buttonText: string;
      buttonHref: string;
      secondaryText: string;
      secondaryHref: string;
      backgroundImage: string;
    };
  };
  spaPage: {
    hero: PageHero;
    seo: PageSeo;
    philosophy: { title: string; content: string; imageSrc: string };
    services: Array<{ id: string; name: string; description: string }>;
    gallery: Array<{ id: string; src: string; title: string }>;
    cta: { title: string; description: string; buttonText: string };
  };
  meetingsEventsPage: {
    hero: PageHero & { ctaText: string; ctaHref: string; media: CmsMedia };
    seo: PageSeo & { keywords: string };
    about: {
      eyebrow: string;
      title: string;
      content: string;
      media: CmsMedia;
    };
    spaces: Array<{
      id: string;
      enabled: boolean;
      order: number;
      title: string;
      subtitle: string;
      description: string;
      capacity: string;
      features: string[];
      media: CmsMedia;
    }>;
    facilities: Array<{
      id: string;
      enabled: boolean;
      order: number;
      title: string;
      description: string;
      icon: string;
    }>;
    gallery: Array<{
      id: string;
      enabled: boolean;
      order: number;
      src: string;
      title: string;
      alt: string;
    }>;
    whyChooseUs: Array<{
      id: string;
      enabled: boolean;
      order: number;
      title: string;
      description: string;
    }>;
    faq: Array<{
      id: string;
      enabled: boolean;
      order: number;
      question: string;
      answer: string;
    }>;
    form: {
      title: string;
      description: string;
      submitLabel: string;
      successTitle: string;
      successMessage: string;
      eventTypes: string[];
    };
    backgroundTop: string;
    backgroundBottom: string;
    goldColor: string;
    headingColor: string;
    bodyColor: string;
  };
  aboutPage: {
    hero: {
      title: string;
      subtitle: string;
      description: string;
      imageSrc: string;
      breadcrumbHome: string;
      breadcrumbCurrent: string;
      overlayOpacity: number;
    };
    story: {
      eyebrow: string;
      title: string;
      content: string;
      imageSrc: string;
      signature: string;
      signatureRole: string;
    };
    stats: Array<{
      id: string;
      enabled: boolean;
      order: number;
      value: string;
      label: string;
    }>;
    philosophy: {
      eyebrow: string;
      title: string;
      content: string;
      mission: { title: string; content: string; icon: string };
      vision: { title: string; content: string; icon: string };
      values: Array<{
        id: string;
        enabled: boolean;
        order: number;
        title: string;
        description: string;
        icon: string;
      }>;
    };
    whyChoose: {
      eyebrow: string;
      title: string;
      description: string;
      items: Array<{
        id: string;
        enabled: boolean;
        order: number;
        title: string;
        description: string;
        icon: string;
      }>;
    };
    discover: {
      eyebrow: string;
      title: string;
      content: string;
      images: Array<{ id: string; src: string; alt: string }>;
    };
    services: {
      eyebrow: string;
      title: string;
      items: Array<{
        id: string;
        enabled: boolean;
        order: number;
        title: string;
        description: string;
        icon: string;
      }>;
    };
    team: {
      eyebrow: string;
      title: string;
      description: string;
      members: Array<{
        id: string;
        enabled: boolean;
        order: number;
        name: string;
        position: string;
        bio: string;
        imageSrc: string;
      }>;
    };
    awards: {
      eyebrow: string;
      title: string;
      items: Array<{
        id: string;
        enabled: boolean;
        order: number;
        year: string;
        title: string;
        description: string;
      }>;
    };
    testimonials: {
      eyebrow: string;
      title: string;
      description: string;
      items: Array<{
        id: string;
        enabled: boolean;
        order: number;
        name: string;
        country: string;
        review: string;
        rating: number;
        imageSrc: string;
      }>;
    };
    galleryPreview: {
      eyebrow: string;
      title: string;
      ctaText: string;
      ctaHref: string;
      images: Array<{ id: string; src: string; alt: string }>;
    };
    cta: {
      title: string;
      description: string;
      primaryText: string;
      primaryHref: string;
      secondaryText: string;
      secondaryHref: string;
      backgroundImage: string;
    };
    seo: PageSeo & { keywords: string };
    /** @deprecated legacy — merged into story/philosophy/services/awards */
    history?: { title: string; content: string };
    mission?: { title: string; content: string };
    vision?: { title: string; content: string };
    facilities?: Array<{ name: string; description: string; icon: string }>;
    timeline?: Array<{ year: string; title: string; description: string }>;
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
    description: string;
    category: string;
    type: "image" | "video";
    alt?: string;
    active?: boolean;
    showOnHome?: boolean;
    featured?: boolean;
    /** Poster/thumbnail for video items */
    poster?: string;
    order?: number;
  }>;
  galleryCategories: Array<{
    id: string;
    name: string;
    enabled: boolean;
    order: number;
    icon?: string;
  }>;
  gallerySection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    description: string;
    ctaText: string;
    ctaHref: string;
    ctaVisible: boolean;
    homeImageLimit: number;
    showMist: boolean;
    backgroundTop: string;
    backgroundBottom: string;
    goldColor: string;
    headingColor: string;
    bodyColor: string;
    borderColor: string;
    cardRadiusPx: number;
    gridGapPx: number;
    overlayOpacity: number;
  };
  articlesHomeSection: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    description: string;
    articleLimit: number;
    autoSlide: boolean;
    slideIntervalMs: number;
    transitionSpeedMs: number;
    showAuthor: boolean;
    showReadingTime: boolean;
    showDate: boolean;
    showCategory: boolean;
    showExcerpt: boolean;
    readMoreText: string;
    backgroundTop: string;
    backgroundBottom: string;
    goldColor: string;
    headingColor: string;
    bodyColor: string;
    borderColor: string;
    cardRadiusPx: number;
    sectionPaddingY: number;
    cardGapPx: number;
  };
  galleryPage: {
    hero: PageHero & {
      media: CmsMedia;
      breadcrumbHome: string;
      breadcrumbCurrent: string;
      overlayOpacity: number;
    };
    seo: PageSeo & { keywords?: string };
    eyebrow: string;
    title: string;
    description: string;
    showFilters: boolean;
    gridColumns: 2 | 3 | 4;
    initialVisible: number;
    loadMoreCount: number;
    featured: {
      eyebrow: string;
      title: string;
      description: string;
      enabled: boolean;
    };
    videos: {
      eyebrow: string;
      title: string;
      description: string;
      enabled: boolean;
    };
    strip: {
      enabled: boolean;
      title: string;
    };
    cta: {
      title: string;
      description: string;
      primaryText: string;
      primaryHref: string;
      secondaryText: string;
      secondaryHref: string;
      backgroundImage: string;
    };
    goldColor: string;
    headingColor: string;
    bodyColor: string;
    borderColor: string;
    backgroundTop: string;
    backgroundBottom: string;
  };
  roomsPage: {
    seo: PageSeo;
  };
  contactPage: {
    hero: {
      title: string;
      subtitle: string;
      description: string;
      imageSrc: string;
      breadcrumbHome: string;
      breadcrumbCurrent: string;
      overlayOpacity: number;
    };
    cards: Array<{
      id: string;
      enabled: boolean;
      order: number;
      icon: string;
      title: string;
      value: string;
      description: string;
      href: string;
    }>;
    form: {
      title: string;
      description: string;
      submitLabel: string;
      successTitle: string;
      successMessage: string;
      consentText: string;
      bookingTypes: string[];
    };
    whyContact: {
      eyebrow: string;
      title: string;
      description: string;
      items: Array<{
        id: string;
        enabled: boolean;
        order: number;
        icon: string;
        title: string;
        description: string;
      }>;
    };
    location: {
      eyebrow: string;
      title: string;
      description: string;
      mapEmbedUrl: string;
      mapsDirectionsUrl: string;
      nearbyTitle: string;
      nearby: Array<{ id: string; title: string; distance: string }>;
    };
    business: {
      eyebrow: string;
      title: string;
      left: Array<{ label: string; value: string }>;
      right: Array<{ label: string; value: string }>;
    };
    faq: {
      eyebrow: string;
      title: string;
      items: Array<{
        id: string;
        enabled: boolean;
        order: number;
        question: string;
        answer: string;
      }>;
    };
    cta: {
      title: string;
      description: string;
      primaryText: string;
      primaryHref: string;
      secondaryText: string;
      secondaryHref: string;
      backgroundImage: string;
    };
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
    seo: PageSeo & { keywords: string };
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
    googleSiteVerification: string;
    bingSiteVerification: string;
  };
  performanceSettings: {
    lazyLoadImages: boolean;
    reduceMotionOnMobile: boolean;
    pwaEnabled: boolean;
    imageFadeIn: boolean;
    cacheStaticAssets: boolean;
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
    /** Centered legal row links (Privacy, Terms, Cancellation, Cookies, Sitemap) */
    legalLinks: NavItem[];
    /** Mountain / pine silhouette artwork behind footer content */
    showMountains: boolean;
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
  articlesPage: {
    hero: PageHero & {
      media: CmsMedia;
      breadcrumbHome: string;
      breadcrumbCurrent: string;
      overlayOpacity: number;
    };
    seo: PageSeo & { keywords?: string };
    eyebrow: string;
    title: string;
    description: string;
    sidebar: {
      searchPlaceholder: string;
      categoriesTitle: string;
      recentTitle: string;
      popularTitle: string;
      featuredTitle: string;
      tagsTitle: string;
      newsletterTitle: string;
      newsletterDescription: string;
      newsletterButton: string;
    };
    newsletterCta: {
      title: string;
      description: string;
      buttonText: string;
    };
    goldColor: string;
    headingColor: string;
    bodyColor: string;
    backgroundTop: string;
    backgroundBottom: string;
  };
  articleAuthors: Array<{
    id: string;
    name: string;
    designation: string;
    bio: string;
    photo: string;
    social: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      twitter?: string;
    };
  }>;
  articleCategories: Array<{
    id: string;
    name: string;
    slug: string;
    enabled: boolean;
    order: number;
  }>;
  articleTags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  articles: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    body: string;
    coverImage: string;
    coverAlt: string;
    categoryId: string;
    tagIds: string[];
    authorId: string;
    readingTime: number;
    publishedAt: string;
    updatedAt?: string;
    status: "draft" | "published" | "scheduled" | "trash";
    featured: boolean;
    pinned: boolean;
    allowComments: boolean;
    relatedIds: string[];
    seo: {
      title: string;
      description: string;
      keywords: string;
      canonical: string;
      ogImage: string;
    };
    faq: Array<{ question: string; answer: string }>;
    toc: Array<{ id: string; label: string; level: 2 | 3 }>;
    revisions?: Array<{
      id: string;
      savedAt: string;
      title: string;
      body: string;
    }>;
    scheduledAt?: string;
    order: number;
  }>;
  mediaLibrary: MediaAsset[];
}

export type HomeSectionKey = keyof SiteContent["homeSections"];
