import type { SiteContent } from "@/lib/cms/types";
import {
  BRAND_LOGO_PATH,
  BRAND_OG_IMAGE_PATH,
  ICON_VERSION,
} from "@/lib/brand";

export const SITE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")) ||
  "https://hotel.theglobalorbit.com";

export const SITE_NAME = "Hotel Thamel Park";

export const SITE_DESCRIPTION =
  "Experience refined comfort, elevated dining, wellness experiences, and exceptional hospitality in the heart of Kathmandu. Luxury hotel in Thamel with Korean restaurant, Skyz Lounge, and premium spa.";

export const SITE_KEYWORDS = [
  "Hotel Thamel Park",
  "Hotel in Thamel Kathmandu",
  "Luxury Hotel Kathmandu",
  "Best Hotel in Thamel",
  "Korean Restaurant Kathmandu",
  "Skyz Lounge Kathmandu",
  "Spa Hotel Nepal",
  "Luxury accommodation Thamel",
  "5 star hotel Kathmandu",
  "Wellness hotel Nepal",
];

/** Absolute brand logo URL for Google Search / Knowledge Panel recognition. */
export const SITE_LOGO_URL = `${SITE_URL}${BRAND_LOGO_PATH}?v=${ICON_VERSION}`;
export const SITE_OG_IMAGE_URL = `${SITE_URL}${BRAND_OG_IMAGE_PATH}?v=${ICON_VERSION}`;

type HotelInfo = SiteContent["hotel"];

function brandLogoObject() {
  return {
    "@type": "ImageObject" as const,
    url: SITE_LOGO_URL,
    contentUrl: SITE_LOGO_URL,
    width: 1024,
    height: 1024,
    caption: SITE_NAME,
  };
}

export function generateOrganizationSchema(hotel?: Partial<HotelInfo>) {
  const name = hotel?.name || SITE_NAME;
  const sameAs = [
    hotel?.social?.facebook,
    hotel?.social?.instagram,
    hotel?.social?.twitter,
    hotel?.social?.tripadvisor,
  ].filter(Boolean) as string[];

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name,
    url: SITE_URL,
    logo: brandLogoObject(),
    image: SITE_LOGO_URL,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function generateHotelSchema(hotel?: Partial<HotelInfo>) {
  const phone = hotel?.phone || "+977-1-4412345";
  const email = hotel?.email || "reservations@hotelthamelpark.com";
  const address = hotel?.address || "Thamel, Kathmandu";
  const name = hotel?.name || SITE_NAME;
  const description = hotel?.description || SITE_DESCRIPTION;
  const sameAs = [
    hotel?.social?.facebook,
    hotel?.social?.instagram,
    hotel?.social?.twitter,
    hotel?.social?.tripadvisor,
  ].filter(Boolean) as string[];

  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "@id": `${SITE_URL}/#hotel`,
    name,
    description,
    url: SITE_URL,
    telephone: phone,
    email,
    logo: brandLogoObject(),
    image: [SITE_LOGO_URL, SITE_OG_IMAGE_URL],
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: "Kathmandu",
      addressRegion: "Bagmati",
      postalCode: "44600",
      addressCountry: "NP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 27.7154,
      longitude: 85.3123,
    },
    starRating: {
      "@type": "Rating",
      ratingValue: "5",
    },
    priceRange: "$$",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Spa", value: true },
      { "@type": "LocationFeatureSpecification", name: "Restaurant", value: true },
      { "@type": "LocationFeatureSpecification", name: "Free WiFi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Airport Transfer", value: true },
      { "@type": "LocationFeatureSpecification", name: "Room Service", value: true },
    ],
    checkinTime: "14:00",
    checkoutTime: "12:00",
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function generateLocalBusinessSchema(hotel?: Partial<HotelInfo>) {
  const phone = hotel?.phone || "+977-1-4412345";
  const email = hotel?.email || "reservations@hotelthamelpark.com";
  const address = hotel?.address || "Thamel, Kathmandu";
  const name = hotel?.name || SITE_NAME;
  const description = hotel?.description || SITE_DESCRIPTION;
  const sameAs = [
    hotel?.social?.facebook || "https://www.facebook.com/hotelthamelpark",
    hotel?.social?.instagram || "https://www.instagram.com/hotelthamelpark",
    hotel?.social?.tripadvisor || "https://www.tripadvisor.com/hotelthamelpark",
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name,
    description,
    url: SITE_URL,
    telephone: phone,
    email,
    logo: brandLogoObject(),
    image: [SITE_LOGO_URL, SITE_OG_IMAGE_URL],
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: "Kathmandu",
      addressRegion: "Bagmati",
      postalCode: "44600",
      addressCountry: "NP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 27.7154,
      longitude: 85.3123,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    sameAs,
  };
}

export function generateHotelRoomSchema(room: {
  name: string;
  description: string;
  slug: string;
  image?: string;
  price?: number | string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.name,
    description: room.description,
    url: `${SITE_URL}/rooms/${room.slug}`,
    image: room.image ? (room.image.startsWith("http") ? room.image : `${SITE_URL}${room.image}`) : undefined,
    ...(room.price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: String(room.price),
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/rooms/${room.slug}`,
          },
        }
      : {}),
  };
}
