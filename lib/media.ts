/**
 * Media configuration — replace paths with your own assets.
 * Place files in /public/media/ and update src values below.
 */
export const heroMedia = {
  type: "video" as "video" | "image",
  videoSrc: "/media/hero.mp4",
  imageSrc: "/media/hero.jpg",
  poster: "/media/hero-poster.jpg",
};

export const pageHeroMedia = {
  about: "/media/pages/about.jpg",
  rooms: "/media/pages/rooms.jpg",
  dining: "/media/pages/dining.jpg",
  spa: "/media/pages/spa.jpg",
  gallery: "/media/pages/gallery.jpg",
  meetings: "/media/pages/meetings.jpg",
  contact: "/media/pages/contact.jpg",
} as const;

export const roomImages: Record<string, string> = {
  "super-deluxe-twin": "/media/rooms/super-deluxe-twin.jpg",
  "super-deluxe": "/media/rooms/super-deluxe.jpg",
  "family-room": "/media/rooms/family-room.jpg",
  "standard-deluxe": "/media/rooms/standard-deluxe.jpg",
};

export const galleryImages = [
  { id: "1", src: "/media/gallery/01.jpg", title: "Grand Arrival", category: "Architecture", aspect: "tall" },
  { id: "2", src: "/media/gallery/02.jpg", title: "Garden Sanctuary", category: "Ambience", aspect: "wide" },
  { id: "3", src: "/media/gallery/03.jpg", title: "Culinary Artistry", category: "Dining", aspect: "square" },
  { id: "4", src: "/media/gallery/04.jpg", title: "Rooftop Serenity", category: "Skyz Lounge", aspect: "tall" },
  { id: "5", src: "/media/gallery/05.jpg", title: "Wellness Haven", category: "Spa", aspect: "wide" },
  { id: "6", src: "/media/gallery/06.jpg", title: "Suite Living", category: "Rooms", aspect: "square" },
  { id: "7", src: "/media/gallery/07.jpg", title: "Evening Ambience", category: "Lounge", aspect: "tall" },
  { id: "8", src: "/media/gallery/08.jpg", title: "Refined Details", category: "Design", aspect: "wide" },
  { id: "9", src: "/media/gallery/09.jpg", title: "Kathmandu Views", category: "Location", aspect: "square" },
] as const;

export const diningImages = {
  restaurant: "/media/dining/korean-restaurant.jpg",
  lounge: "/media/dining/skyz-lounge.jpg",
};

export const spaImages = {
  hero: "/media/spa/wellness.jpg",
  treatment: "/media/spa/treatment.jpg",
};

export const meetingsImages = {
  ballroom: "/media/events/ballroom.jpg",
  wedding: "/media/events/wedding.jpg",
  conference: "/media/events/conference.jpg",
};
