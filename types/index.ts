export interface NavItem {
  label: string;
  href: string;
}

export interface Room {
  id: string;
  name: string;
  price: number;
  description: string;
  amenities: string[];
  occupancy: string;
  features: string[];
  gradient: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface DiningVenue {
  name: string;
  tagline: string;
  features: string[];
  gradient: string;
}

export interface SpaService {
  name: string;
  description: string;
}

export interface Facility {
  name: string;
  icon: string;
}

export interface Testimonial {
  name: string;
  country: string;
  rating: number;
  review: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface TrustIndicator {
  label: string;
}
