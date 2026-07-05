export const TRUST_INDICATORS = [
  "Prime Thamel Location",
  "Garden View Korean Restaurant",
  "Skyz Lounge",
  "Luxury Spa",
] as const;

export const STATS = [
  { value: 1000, suffix: "+", label: "Happy Guests" },
  { value: 4, suffix: "", label: "Premium Room Categories" },
  { value: 1, suffix: "", label: "Premium Spa Experience" },
  { value: 1, suffix: "", label: "Prime Kathmandu Location" },
] as const;

export const WHY_CHOOSE_US = [
  {
    title: "Prime Thamel Location",
    description:
      "Situated in the vibrant heart of Thamel, steps from cultural landmarks, shopping, and dining.",
    icon: "MapPin",
  },
  {
    title: "Airport Assistance",
    description:
      "Seamless arrival and departure with dedicated airport transfer and concierge support.",
    icon: "Plane",
  },
  {
    title: "Wellness Spa",
    description:
      "Rejuvenating treatments and therapies designed for complete relaxation and renewal.",
    icon: "Sparkles",
  },
  {
    title: "Skyz Lounge",
    description:
      "Elevated rooftop ambience with signature cocktails and panoramic Kathmandu views.",
    icon: "Wine",
  },
  {
    title: "Garden View Korean Restaurant",
    description:
      "Authentic Korean cuisine crafted with premium ingredients in an elegant garden setting.",
    icon: "UtensilsCrossed",
  },
  {
    title: "Modern Rooms",
    description:
      "Thoughtfully appointed accommodations blending contemporary comfort with refined elegance.",
    icon: "Bed",
  },
  {
    title: "Personalized Service",
    description:
      "Attentive, bespoke hospitality tailored to every guest's unique preferences.",
    icon: "HeartHandshake",
  },
  {
    title: "Travel Assistance",
    description:
      "Expert guidance for tours, excursions, and cultural experiences across Nepal.",
    icon: "Compass",
  },
] as const;

export const ROOMS = [
  {
    id: "super-deluxe-twin",
    name: "Super Deluxe Twin",
    price: 60,
    description:
      "An exquisite twin room offering refined comfort with elegant furnishings and serene ambiance for discerning travelers.",
    amenities: ["Twin Beds", "En-suite Bathroom", "Climate Control", "Work Desk", "Premium Toiletries"],
    occupancy: "2 Guests",
    features: ["City View", "Sound Insulation", "Daily Housekeeping", "In-room Safe"],
    gradient: "from-luxury-cream via-white to-luxury-sand",
  },
  {
    id: "super-deluxe",
    name: "Super Deluxe Room",
    price: 60,
    description:
      "A spacious sanctuary of luxury featuring a king bed, sophisticated décor, and every amenity for an exceptional stay.",
    amenities: ["King Bed", "En-suite Bathroom", "Mini Bar", "Smart TV", "Bathrobes"],
    occupancy: "2 Guests",
    features: ["Garden View", "Premium Linens", "Room Service", "Complimentary WiFi"],
    gradient: "from-white via-luxury-cream to-luxury-gold/10",
  },
  {
    id: "family-room",
    name: "Family Room",
    price: 55,
    description:
      "Generously designed for families, combining comfort and space with thoughtful amenities for memorable stays together.",
    amenities: ["Multiple Beds", "Spacious Layout", "En-suite Bathroom", "Seating Area", "Extra Storage"],
    occupancy: "4 Guests",
    features: ["Family Friendly", "Connecting Options", "Child Amenities", "Quiet Zone"],
    gradient: "from-luxury-sand via-luxury-cream to-white",
  },
  {
    id: "standard-deluxe",
    name: "Standard Deluxe Room",
    price: 50,
    description:
      "Elegant simplicity meets luxury comfort in our thoughtfully curated standard deluxe accommodation.",
    amenities: ["Queen Bed", "En-suite Bathroom", "Climate Control", "Work Space", "Premium WiFi"],
    occupancy: "2 Guests",
    features: ["Efficient Layout", "Quality Furnishings", "Daily Refresh", "Concierge Access"],
    gradient: "from-white to-luxury-cream",
  },
] as const;

export const DINING_VENUES = [
  {
    name: "Garden View Korean Restaurant",
    tagline: "Authentic flavors in an elegant garden sanctuary",
    features: [
      "Authentic Korean Cuisine",
      "Premium Ingredients",
      "Elegant Atmosphere",
      "Family Dining",
      "Chef Crafted Experience",
    ],
    gradient: "from-luxury-cream via-luxury-sand/50 to-luxury-gold/5",
  },
  {
    name: "Skyz Lounge",
    tagline: "Elevated evenings above the Kathmandu skyline",
    features: [
      "Rooftop Ambience",
      "Signature Drinks",
      "Evening Relaxation",
      "Social Gatherings",
      "Kathmandu City Atmosphere",
    ],
    gradient: "from-luxury-gold/5 via-luxury-cream to-white",
  },
] as const;

export const SPA_SERVICES = [
  {
    name: "Relaxation Therapy",
    description: "Gentle, restorative treatments to melt away tension and restore inner calm.",
  },
  {
    name: "Deep Tissue Massage",
    description: "Targeted therapeutic massage to release deep muscle tension and improve mobility.",
  },
  {
    name: "Aromatherapy",
    description: "Essential oil blends curated to harmonize body, mind, and spirit.",
  },
  {
    name: "Foot Reflexology",
    description: "Ancient healing techniques applied to pressure points for total body wellness.",
  },
  {
    name: "Wellness Packages",
    description: "Comprehensive spa journeys combining multiple treatments for complete rejuvenation.",
  },
  {
    name: "Premium Rejuvenation",
    description: "Our signature luxury experience for the ultimate in spa indulgence.",
  },
] as const;

export const FACILITIES = [
  { name: "Free WiFi", icon: "Wifi" },
  { name: "Airport Transfer", icon: "Plane" },
  { name: "Room Service", icon: "Hotel" },
  { name: "Restaurant", icon: "UtensilsCrossed" },
  { name: "Skyz Lounge", icon: "Wine" },
  { name: "Spa", icon: "Sparkles" },
  { name: "Family Rooms", icon: "Users" },
  { name: "Daily Housekeeping", icon: "Sparkle" },
  { name: "24/7 Front Desk", icon: "Clock" },
  { name: "Travel Assistance", icon: "Compass" },
  { name: "Luggage Storage", icon: "Briefcase" },
  { name: "Currency Exchange", icon: "CircleDollarSign" },
] as const;

export const TESTIMONIALS = [
  {
    name: "Elena Richardson",
    country: "United Kingdom",
    rating: 5,
    review:
      "An absolutely exceptional stay. The attention to detail, the spa experience, and the Korean restaurant exceeded every expectation. Thamel's finest.",
  },
  {
    name: "James Nakamura",
    country: "Japan",
    rating: 5,
    review:
      "The Skyz Lounge at sunset is unforgettable. Impeccable service throughout our stay — truly world-class hospitality in Kathmandu.",
  },
  {
    name: "Sophie Laurent",
    country: "France",
    rating: 5,
    review:
      "From the moment we arrived, every detail was perfect. The family room was spacious and elegant. We will return without hesitation.",
  },
  {
    name: "Michael O'Brien",
    country: "Australia",
    rating: 5,
    review:
      "Perfect location in Thamel with luxury that rivals international five-star properties. The spa treatments were transformative.",
  },
  {
    name: "Priya Sharma",
    country: "India",
    rating: 5,
    review:
      "A hidden gem in Kathmandu. Personalized service, beautiful rooms, and the garden restaurant is a culinary masterpiece.",
  },
] as const;

export const LOCATION_HIGHLIGHTS = [
  {
    title: "Located in Thamel",
    description: "The cultural and commercial heart of Kathmandu, vibrant yet refined.",
  },
  {
    title: "Tourist Attractions Nearby",
    description: "Kathmandu Durbar Square, Swayambhunath, and heritage sites within reach.",
  },
  {
    title: "Shopping Areas",
    description: "Boutiques, artisan markets, and premium shopping at your doorstep.",
  },
  {
    title: "Restaurants Nearby",
    description: "World-class dining options and local culinary treasures surround the hotel.",
  },
  {
    title: "Transportation Access",
    description: "Easy access to taxis, local transport, and tour arrangements.",
  },
  {
    title: "Airport Connectivity",
    description: "Tribhuvan International Airport approximately 6 km with transfer service.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "What is the check-in time?",
    answer:
      "Check-in begins at 2:00 PM. Early check-in is subject to availability and may incur additional charges. Our concierge team is happy to assist with luggage storage upon early arrival.",
  },
  {
    question: "What is the check-out time?",
    answer:
      "Check-out is at 12:00 PM. Late check-out can be arranged based on availability. Please contact the front desk to request an extension.",
  },
  {
    question: "Do you offer airport transfer?",
    answer:
      "Yes, we provide complimentary airport transfer for guests booking directly through our website. Please provide your flight details at least 24 hours before arrival.",
  },
  {
    question: "How do I book spa treatments?",
    answer:
      "Spa appointments can be made through our front desk, in-room directory, or by contacting the spa directly. We recommend booking in advance to secure your preferred time.",
  },
  {
    question: "Can I make restaurant reservations?",
    answer:
      "Reservations for Garden View Korean Restaurant and Skyz Lounge can be made through our concierge. Walk-ins are welcome subject to availability.",
  },
  {
    question: "How do I book a room?",
    answer:
      "Rooms can be booked directly through our website, by phone, or via email. Our reservations team is available 24/7 to assist with your booking.",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "Cancellations made 48 hours prior to arrival receive a full refund. Cancellations within 48 hours may be subject to one night's charge. Special rate bookings may have different terms.",
  },
  {
    question: "Are family rooms available?",
    answer:
      "Yes, our Family Room accommodates up to four guests with spacious layout and family-friendly amenities. Connecting rooms may also be available upon request.",
  },
] as const;

export const FOOTER_LINKS = {
  about: [
    { label: "Our Story", href: "overview" },
    { label: "Why Choose Us", href: "why-choose-us" },
    { label: "Guest Experience", href: "testimonials" },
    { label: "Location", href: "location" },
  ],
  rooms: [
    { label: "Super Deluxe Twin", href: "rooms" },
    { label: "Super Deluxe Room", href: "rooms" },
    { label: "Family Room", href: "rooms" },
    { label: "Standard Deluxe", href: "rooms" },
  ],
  dining: [
    { label: "Korean Restaurant", href: "dining" },
    { label: "Skyz Lounge", href: "dining" },
    { label: "Reservations", href: "contact" },
  ],
  spa: [
    { label: "Spa Services", href: "spa" },
    { label: "Wellness Packages", href: "spa" },
    { label: "Book Treatment", href: "contact" },
  ],
  quick: [
    { label: "FAQ", href: "faq" },
    { label: "Facilities", href: "facilities" },
    { label: "Privacy Policy", href: "privacy" },
    { label: "Terms & Conditions", href: "terms" },
  ],
} as const;

export const AWARDS = [
  "Excellence in Hospitality",
  "Premium Wellness Destination",
  "Culinary Distinction Award",
  "Guest Choice Recognition",
] as const;

export const ROOM_TYPES = [
  "Super Deluxe Twin",
  "Super Deluxe Room",
  "Family Room",
  "Standard Deluxe Room",
] as const;
