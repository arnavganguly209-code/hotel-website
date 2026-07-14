export const SITE_URL = "https://www.hotelthamelpark.com";

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

export function generateHotelSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: "+977-1-4412345",
    email: "reservations@hotelthamelpark.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Thamel, Kathmandu",
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
  };
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: "+977-1-4412345",
    email: "reservations@hotelthamelpark.com",
    image: SITE_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Thamel, Kathmandu",
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
    sameAs: [
      "https://www.facebook.com/hotelthamelpark",
      "https://www.instagram.com/hotelthamelpark",
      "https://www.tripadvisor.com/hotelthamelpark",
    ],
  };
}
