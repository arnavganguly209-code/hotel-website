import type { SiteContent } from "./types";

type Article = SiteContent["articles"][number];

const COVER =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80";
const COVERS = [
  COVER,
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1600&q=80",
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function articleHtml(opts: {
  intro: string;
  sections: Array<{ id: string; title: string; paragraphs: string[]; h3?: Array<{ id: string; title: string; text: string }> }>;
  cta: string;
  faq: Array<{ q: string; a: string }>;
}) {
  const sectionsHtml = opts.sections
    .map((s) => {
      const paras = s.paragraphs.map((p) => `<p>${p}</p>`).join("");
      const h3s = (s.h3 || [])
        .map((h) => `<h3 id="${h.id}">${h.title}</h3><p>${h.text}</p>`)
        .join("");
      return `<h2 id="${s.id}">${s.title}</h2>${paras}${h3s}`;
    })
    .join("");
  const faqHtml = opts.faq
    .map(
      (f) =>
        `<h3>${f.q}</h3><p>${f.a}</p>`
    )
    .join("");
  return `<p class="lead">${opts.intro}</p>${sectionsHtml}<h2 id="plan-your-stay">Plan Your Stay</h2><p>${opts.cta}</p><h2 id="faq">Frequently Asked Questions</h2>${faqHtml}`;
}

const TOPICS: Array<{
  title: string;
  categoryId: string;
  tagIds: string[];
  keywords: string;
  excerpt: string;
  intro: string;
  sections: Array<{ id: string; title: string; paragraphs: string[]; h3?: Array<{ id: string; title: string; text: string }> }>;
  faq: Array<{ q: string; a: string }>;
  featured?: boolean;
  pinned?: boolean;
}> = [
  {
    title: "Best Luxury Hotels in Kathmandu",
    categoryId: "cat-luxury",
    tagIds: ["tag-kathmandu", "tag-luxury", "tag-hotels"],
    keywords: "best luxury hotels kathmandu, luxury hotel nepal, five star hotel kathmandu",
    excerpt:
      "A curated guide to Kathmandu’s finest luxury hotels — refined suites, spa sanctuaries, and elevated hospitality in Nepal’s capital.",
    featured: true,
    pinned: true,
    intro:
      "Choosing among the <strong>best luxury hotels in Kathmandu</strong> means balancing Himalayan atmosphere, service excellence, and a location that makes exploring the city effortless. This editorial guide highlights what defines five-star hospitality in Nepal’s capital — and how <a href=\"/articles/complete-guide-to-hotel-thamel-park-spa\">Hotel Thamel Park &amp; Spa</a> fits into a refined Kathmandu itinerary.",
    sections: [
      {
        id: "what-defines-luxury",
        title: "What Defines Luxury Hospitality in Kathmandu",
        paragraphs: [
          "Luxury in Kathmandu is not only marble lobbies and fine linens. It is attentive concierge care, quiet rooms after busy temple streets, spa rituals that restore after travel, and dining that celebrates Nepali and international flavours with elegance.",
          "Look for properties with curated design, reliable Wi‑Fi for travellers and remote workers, airport transfer options, and staff who understand both pilgrimage journeys and leisure escapes.",
        ],
        h3: [
          {
            id: "location-matters",
            title: "Location Still Matters",
            text: "Thamel remains the most walkable base for culture, dining, and shopping. A luxury address here — such as Hotel Thamel Park &amp; Spa — pairs boutique calm with access to Kathmandu’s most vibrant quarter.",
          },
        ],
      },
      {
        id: "how-to-choose",
        title: "How to Choose the Right Luxury Hotel",
        paragraphs: [
          "Compare room categories carefully: family suites, twin deluxe layouts, and spa packages can transform a short stay. Read recent guest notes on breakfast quality, noise insulation, and rooftop or lounge spaces.",
          "For a romantic weekend, prioritise spa and sky lounge moments. For business, focus on meeting rooms and reliable desks. For first-time visitors, stay close to Thamel and UNESCO sites.",
        ],
      },
      {
        id: "where-to-book",
        title: "Where Discerning Guests Book",
        paragraphs: [
          "Direct booking often unlocks flexible rates, late checkout requests, and spa add-ons. Explore <a href=\"/rooms\">rooms at Hotel Thamel Park</a>, then refine with our <a href=\"/spa\">spa experiences</a> and <a href=\"/restaurant\">restaurants</a>.",
        ],
      },
    ],
    faq: [
      {
        q: "Which area is best for luxury hotels in Kathmandu?",
        a: "Thamel and nearby central districts offer the best mix of access and atmosphere for most luxury travellers.",
      },
      {
        q: "Do luxury hotels in Kathmandu include spa facilities?",
        a: "Many premium properties offer spa and wellness — Hotel Thamel Park & Spa is purpose-built around restorative rituals and quiet guest floors.",
      },
    ],
  },
  {
    title: "Best Hotels in Thamel Kathmandu",
    categoryId: "cat-guides",
    tagIds: ["tag-thamel", "tag-hotels", "tag-kathmandu"],
    keywords: "best hotels in thamel, thamel hotel, where to stay thamel kathmandu",
    excerpt:
      "Find the best hotels in Thamel — from boutique luxury to family-friendly stays in Kathmandu’s cultural heart.",
    featured: true,
    intro:
      "Searching for the <strong>best hotels in Thamel Kathmandu</strong>? Thamel concentrates craft shops, cafés, live music, and trek briefing offices — making hotel choice especially important for restful nights.",
    sections: [
      {
        id: "why-thamel",
        title: "Why Stay in Thamel",
        paragraphs: [
          "Thamel is walkable, well-connected, and alive from morning espresso to late rooftop evenings. Guests who stay here save transfer time and experience Kathmandu’s creative energy daily.",
          "A refined hotel buffer — soundproofing, spa, and calm courtyards — turns Thamel from chaotic to charming.",
        ],
      },
      {
        id: "hotel-types",
        title: "Types of Thamel Hotels",
        paragraphs: [
          "Boutique luxury properties emphasise design and wellness. Mid-range hotels prioritise value and tour desks. Hostels suit backpackers. For elevated comfort, choose a spa hotel with spacious rooms and on-site dining.",
        ],
        h3: [
          {
            id: "thamel-park-edge",
            title: "The Hotel Thamel Park Advantage",
            text: "Hotel Thamel Park &amp; Spa combines Thamel’s location with luxury rooms, spa, Korean dining, lobby café, and Sky Lounge — ideal for couples, families, and business travellers.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "Is Thamel safe for tourists?",
        a: "Yes — Thamel is a primary tourist district with hotels, restaurants, and 24/7 activity. Choose reputable hotels and use hotel taxis at night.",
      },
      {
        q: "Can I walk to major attractions from Thamel?",
        a: "Durbar Square, Garden of Dreams, and many temples are short taxi or rickshaw rides; many cafés and shops are steps away.",
      },
    ],
  },
  {
    title: "Where to Stay in Kathmandu",
    categoryId: "cat-guides",
    tagIds: ["tag-kathmandu", "tag-travel", "tag-hotels"],
    keywords: "where to stay in kathmandu, kathmandu accommodation, best area to stay kathmandu",
    excerpt:
      "Compare Kathmandu neighbourhoods and decide where to stay — Thamel, Lazimpat, Patan, or airport-side — with luxury tips.",
    intro:
      "Wondering <strong>where to stay in Kathmandu</strong>? Neighbourhood personality matters as much as star rating. This guide maps areas for first visits, luxury weekends, and extended Nepal itineraries.",
    sections: [
      {
        id: "neighbourhoods",
        title: "Kathmandu Neighbourhoods at a Glance",
        paragraphs: [
          "<strong>Thamel</strong> — best for first-timers who want walkability and nightlife energy with a luxury hotel base.",
          "<strong>Lazimpat / Baluwatar</strong> — quieter embassy-side streets. <strong>Patan</strong> — artisan heritage. <strong>Airport corridor</strong> — convenient for short layovers.",
        ],
      },
      {
        id: "recommendation",
        title: "Our Recommendation for Most Travellers",
        paragraphs: [
          "For culture, dining, and ease, stay in Thamel at a hotel that softens the street energy — then day-trip to Patan, Bhaktapur, and Nagarkot. Start with <a href=\"/articles/complete-guide-to-hotel-thamel-park-spa\">our complete hotel guide</a>.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Kathmandu better than Pokhara for a first hotel night?",
        a: "Most international arrivals land in Kathmandu — a quality hotel night here before domestic flights or road journeys is wise.",
      },
    ],
  },
  {
    title: "Luxury Stay in Nepal",
    categoryId: "cat-luxury",
    tagIds: ["tag-luxury", "tag-nepal", "tag-travel"],
    keywords: "luxury stay nepal, luxury travel nepal, nepal luxury hotels",
    excerpt:
      "Design a luxury stay in Nepal — from Kathmandu spa hotels to mountain views — with hospitality insights for elevated travel.",
    featured: true,
    intro:
      "A <strong>luxury stay in Nepal</strong> can weave heritage cities, Himalayan horizons, and wellness into one seamless journey. Kathmandu is the elegant gateway.",
    sections: [
      {
        id: "luxury-journey",
        title: "Building a Luxury Nepal Journey",
        paragraphs: [
          "Begin with two to three nights in a Kathmandu spa hotel, add a heritage day in Bhaktapur, then continue to Pokhara or a mountain lodge. Book spa treatments early and request airport VIP transfers.",
        ],
      },
      {
        id: "kathmandu-anchor",
        title: "Anchoring in Kathmandu",
        paragraphs: [
          "Hotel Thamel Park &amp; Spa offers rooms, spa, dining, and event spaces that support both leisure and celebration travel. Explore <a href=\"/book\">booking options</a> or <a href=\"/contact\">speak with concierge</a>.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the best season for luxury travel in Nepal?",
        a: "October–November and March–April offer clear skies; monsoon months suit spa-focused city stays.",
      },
    ],
  },
  {
    title: "Best Boutique Hotels in Kathmandu",
    categoryId: "cat-luxury",
    tagIds: ["tag-boutique", "tag-hotels", "tag-kathmandu"],
    keywords: "boutique hotels kathmandu, best boutique hotel nepal",
    excerpt:
      "Discover boutique hotels in Kathmandu that prioritise design, intimacy, and personalised service over mega-resort scale.",
    intro:
      "The <strong>best boutique hotels in Kathmandu</strong> trade vast lobbies for character — thoughtful lighting, curated art, and hosts who remember your coffee order.",
    sections: [
      {
        id: "boutique-traits",
        title: "Signatures of a True Boutique Stay",
        paragraphs: [
          "Expect distinctive interiors, limited room inventory, strong food-and-beverage identity, and spa or wellness corners. Hotel Thamel Park blends boutique intimacy with full spa and dining programmes.",
        ],
      },
    ],
    faq: [
      {
        q: "Are boutique hotels more expensive?",
        a: "Not always — many deliver better value through included breakfast, spa access, and personalised service.",
      },
    ],
  },
  {
    title: "Kathmandu Travel Guide",
    categoryId: "cat-guides",
    tagIds: ["tag-kathmandu", "tag-travel", "tag-guide"],
    keywords: "kathmandu travel guide, visit kathmandu, kathmandu itinerary tips",
    excerpt:
      "Your premium Kathmandu travel guide — temples, food, transport, safety, and where luxury travellers should base themselves.",
    featured: true,
    intro:
      "This <strong>Kathmandu travel guide</strong> distils the essentials for first-time and returning visitors who want culture without compromise on comfort.",
    sections: [
      {
        id: "getting-around",
        title: "Getting Around Kathmandu",
        paragraphs: [
          "Use hotel cars for airport runs, Pathao or inDrive for short hops, and walking within Thamel. Allow buffer time for traffic when catching domestic flights.",
        ],
      },
      {
        id: "must-see",
        title: "Must-See Experiences",
        paragraphs: [
          "Swayambhunath, Boudhanath, Pashupatinath, Kathmandu Durbar Square, Patan Museum, and a rooftop sunset. Pair long temple days with spa evenings — see <a href=\"/articles/things-to-do-near-thamel\">things to do near Thamel</a>.",
        ],
      },
    ],
    faq: [
      {
        q: "How many days do I need in Kathmandu?",
        a: "Two full days cover highlights; three to four days allow Patan, Bhaktapur, and relaxed dining.",
      },
    ],
  },
  {
    title: "Things to Do Near Thamel",
    categoryId: "cat-experiences",
    tagIds: ["tag-thamel", "tag-experiences", "tag-kathmandu"],
    keywords: "things to do near thamel, thamel attractions, activities thamel",
    excerpt:
      "Curated things to do near Thamel — Garden of Dreams, Durbar Square, cafés, shopping, and evening lounges.",
    intro:
      "Looking for <strong>things to do near Thamel</strong>? You can fill days without leaving the district — then retreat to spa calm at your hotel.",
    sections: [
      {
        id: "daytime",
        title: "Daytime Near Thamel",
        paragraphs: [
          "Garden of Dreams, Kathmandu Durbar Square, Asan market, and Thamel’s bookshops reward slow wandering. Hire a guide for temple etiquette and hidden courtyards.",
        ],
      },
      {
        id: "evening",
        title: "Evenings Worth Dressing For",
        paragraphs: [
          "Live music cafés, craft cocktail bars, and hotel sky lounges. End with a nightcap at <a href=\"/restaurant\">Sky Lounge</a> after dinner.",
        ],
      },
    ],
    faq: [
      {
        q: "Is shopping good in Thamel?",
        a: "Yes — cashmere, singing bowls, trekking gear, and artisan crafts. Compare prices and ask hotels for trusted shops.",
      },
    ],
  },
  {
    title: "Best Restaurants in Kathmandu",
    categoryId: "cat-dining",
    tagIds: ["tag-dining", "tag-kathmandu", "tag-food"],
    keywords: "best restaurants kathmandu, where to eat kathmandu, fine dining kathmandu",
    excerpt:
      "A luxury diner’s map of Kathmandu — Newari feasts, Korean flavours, rooftop evenings, and hotel restaurants worth booking.",
    intro:
      "The <strong>best restaurants in Kathmandu</strong> span heritage Newari kitchens, international hotel dining, and creative Thamel tables.",
    sections: [
      {
        id: "flavours",
        title: "Flavours to Seek",
        paragraphs: [
          "Try Newari samay baji, momo tasting menus, thakali sets, and Korean barbecue. Hotel Thamel Park’s dining programme pairs Korean cuisine with lobby café calm and skyline evenings.",
        ],
      },
      {
        id: "reservations",
        title: "Reservations & Hotel Dining",
        paragraphs: [
          "Book popular rooftops on weekends. In-house guests can reserve through reception — start at our <a href=\"/restaurant\">restaurant page</a>.",
        ],
      },
    ],
    faq: [
      {
        q: "Is street food safe in Kathmandu?",
        a: "Choose busy stalls, cooked-to-order food, and bottled water. Hotel restaurants remain the safest luxury option.",
      },
    ],
  },
  {
    title: "Best Spa Hotels in Nepal",
    categoryId: "cat-wellness",
    tagIds: ["tag-spa", "tag-wellness", "tag-nepal"],
    keywords: "best spa hotels nepal, spa hotel kathmandu, wellness hotel nepal",
    excerpt:
      "Find spa hotels in Nepal that deliver genuine wellness — treatments, quiet rooms, and restorative rituals after travel days.",
    featured: true,
    intro:
      "The <strong>best spa hotels in Nepal</strong> understand altitude journeys, dusty roads, and the need for deep rest. Kathmandu spa hotels set the tone for your entire trip.",
    sections: [
      {
        id: "spa-criteria",
        title: "What to Look for in a Spa Hotel",
        paragraphs: [
          "Qualified therapists, calm treatment rooms, post-treatment lounges, and packages that combine room + spa. Review menus for Ayurvedic, aromatherapy, and couples rituals.",
        ],
      },
      {
        id: "thamel-spa",
        title: "Spa at Hotel Thamel Park",
        paragraphs: [
          "Our spa welcomes hotel guests and day visitors. Explore treatments on the <a href=\"/spa\">spa page</a> and pair with a deluxe room stay.",
        ],
      },
    ],
    faq: [
      {
        q: "Should I book spa treatments in advance?",
        a: "Yes — especially weekends and festival periods. Concierge can hold preferred times at check-in.",
      },
    ],
  },
  {
    title: "Hotel Booking Tips for Nepal",
    categoryId: "cat-tips",
    tagIds: ["tag-tips", "tag-travel", "tag-hotels"],
    keywords: "hotel booking tips nepal, book hotel kathmandu, nepal hotel advice",
    excerpt:
      "Practical hotel booking tips for Nepal — seasons, deposits, cancellations, direct vs OTA, and what to confirm before arrival.",
    intro:
      "Smart <strong>hotel booking tips for Nepal</strong> save money and stress — especially around festivals, trekking seasons, and domestic flight delays.",
    sections: [
      {
        id: "timing",
        title: "Book Timing & Seasons",
        paragraphs: [
          "Peak months fill early. Shoulder seasons offer value. Always confirm airport transfer and early check-in if landing before dawn.",
        ],
      },
      {
        id: "direct-booking",
        title: "Why Book Direct",
        paragraphs: [
          "Direct reservations often include flexible tweaks, spa credits, and clearer communication. Use <a href=\"/book\">our booking page</a> or <a href=\"/contact\">contact reservations</a>.",
        ],
      },
    ],
    faq: [
      {
        q: "Do I need a credit card to book?",
        a: "Many hotels accept cards or bank transfer. Confirm currency and cancellation windows in writing.",
      },
    ],
  },
  {
    title: "Luxury Family Hotels in Kathmandu",
    categoryId: "cat-family",
    tagIds: ["tag-family", "tag-luxury", "tag-hotels"],
    keywords: "family hotels kathmandu, luxury family hotel nepal, hotels with family rooms kathmandu",
    excerpt:
      "Family-friendly luxury hotels in Kathmandu — spacious rooms, safe locations, and amenities that keep every generation comfortable.",
    intro:
      "<strong>Luxury family hotels in Kathmandu</strong> should offer connecting or family rooms, reliable breakfast, and a location that minimises exhausting transfers with children.",
    sections: [
      {
        id: "family-needs",
        title: "What Families Should Prioritise",
        paragraphs: [
          "Extra beds or family suites, elevator access, in-room tea/coffee, laundry options, and nearby pharmacies. Thamel hotels with calm floors work well between sightseeing days.",
        ],
      },
    ],
    faq: [
      {
        q: "Does Hotel Thamel Park have family rooms?",
        a: "Yes — explore family and deluxe categories on our <a href=\"/rooms\">rooms page</a>.",
      },
    ],
  },
  {
    title: "Romantic Hotels in Kathmandu",
    categoryId: "cat-romance",
    tagIds: ["tag-romance", "tag-luxury", "tag-hotels"],
    keywords: "romantic hotels kathmandu, honeymoon hotel kathmandu, couples spa kathmandu",
    excerpt:
      "Romantic hotels in Kathmandu for anniversaries and honeymoons — spa suites, sky lounges, and intimate dining.",
    intro:
      "Planning a getaway among <strong>romantic hotels in Kathmandu</strong>? Seek soft lighting, couples spa menus, and evenings above the city glow.",
    sections: [
      {
        id: "romance-ideas",
        title: "Romance-Ready Moments",
        paragraphs: [
          "Book a couples massage, private dinner, and late checkout. Request rose décor or cake through concierge when booking direct.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Kathmandu good for a honeymoon?",
        a: "Yes as a stylish city base before mountain lodges — especially with spa and rooftop experiences.",
      },
    ],
  },
  {
    title: "Business Hotels in Kathmandu",
    categoryId: "cat-business",
    tagIds: ["tag-business", "tag-meetings", "tag-hotels"],
    keywords: "business hotels kathmandu, meeting hotels kathmandu, corporate stay nepal",
    excerpt:
      "Business hotels in Kathmandu with meeting spaces, reliable connectivity, and central access for corporate travellers.",
    intro:
      "Corporate travellers need <strong>business hotels in Kathmandu</strong> that deliver quiet desks, strong Wi‑Fi, and professional event rooms.",
    sections: [
      {
        id: "business-amenities",
        title: "Amenities That Matter",
        paragraphs: [
          "Early breakfast, printer access, meeting packages, and airport transfers. Review <a href=\"/meetings-events\">Meetings &amp; Events</a> at Hotel Thamel Park for conferences and boardrooms.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I host a small conference in Thamel?",
        a: "Yes — hotel meeting rooms and ballroom spaces support corporate and social events.",
      },
    ],
  },
  {
    title: "Kathmandu Weekend Itinerary",
    categoryId: "cat-experiences",
    tagIds: ["tag-itinerary", "tag-kathmandu", "tag-travel"],
    keywords: "kathmandu weekend itinerary, 2 days in kathmandu, weekend trip kathmandu",
    excerpt:
      "A refined two-day Kathmandu weekend itinerary — temples, cuisine, spa time, and Thamel evenings.",
    intro:
      "This <strong>Kathmandu weekend itinerary</strong> balances iconic sights with restorative hotel time — ideal for domestic getaways and short international hops.",
    sections: [
      {
        id: "day-one",
        title: "Day One — Heritage & Flavours",
        paragraphs: [
          "Morning Durbar Square, lunch in Thamel, afternoon Garden of Dreams, evening spa and sky lounge.",
        ],
      },
      {
        id: "day-two",
        title: "Day Two — Stupas & Slow Luxury",
        paragraphs: [
          "Boudhanath sunrise or mid-morning visit, Patan afternoon, farewell dinner at the hotel. See also our <a href=\"/articles/kathmandu-travel-guide\">Kathmandu travel guide</a>.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I do Bhaktapur in a weekend?",
        a: "Possible as a half-day trip, but two full Kathmandu days feel less rushed.",
      },
    ],
  },
  {
    title: "Complete Guide to Hotel Thamel Park & Spa",
    categoryId: "cat-hotel",
    tagIds: ["tag-thamel-park", "tag-spa", "tag-hotels"],
    keywords: "hotel thamel park spa, hotel thamel park review, thamel park kathmandu",
    excerpt:
      "The complete guide to Hotel Thamel Park & Spa — rooms, spa, dining, events, location, and how to book your stay.",
    featured: true,
    pinned: true,
    intro:
      "Welcome to the <strong>complete guide to Hotel Thamel Park &amp; Spa</strong> — a luxury hospitality address in the heart of Thamel, Kathmandu, designed for travellers who want culture and calm in one stay.",
    sections: [
      {
        id: "overview",
        title: "Hotel Overview",
        paragraphs: [
          "Hotel Thamel Park &amp; Spa combines refined rooms, a full spa, Korean and international dining, lobby café moments, Sky Lounge evenings, and flexible meeting spaces — all within Thamel’s walkable core.",
        ],
      },
      {
        id: "rooms",
        title: "Rooms & Suites",
        paragraphs: [
          "From Super Deluxe to family configurations, rooms emphasise rest after Kathmandu days. Browse categories on <a href=\"/rooms\">our rooms page</a>.",
        ],
      },
      {
        id: "wellness-dining",
        title: "Spa, Dining & Events",
        paragraphs: [
          "Book spa rituals, reserve dinner, or plan weddings and conferences. Visit <a href=\"/spa\">Spa</a>, <a href=\"/restaurant\">Restaurant</a>, and <a href=\"/meetings-events\">Meetings &amp; Events</a>.",
        ],
      },
      {
        id: "how-to-book",
        title: "How to Book",
        paragraphs: [
          "Reserve online via <a href=\"/book\">Book Your Stay</a>, or message reservations through <a href=\"/contact\">Contact</a> for tailored packages.",
        ],
      },
    ],
    faq: [
      {
        q: "Where is Hotel Thamel Park & Spa located?",
        a: "In Thamel, Kathmandu — ideal for travellers seeking both nightlife energy and luxury rest.",
      },
      {
        q: "Does the hotel have a spa?",
        a: "Yes — a dedicated spa and wellness programme for guests and visitors.",
      },
    ],
  },
];

export const defaultArticleAuthors: SiteContent["articleAuthors"] = [
  {
    id: "author-concierge",
    name: "Ananya Sharma",
    designation: "Editorial Concierge",
    bio: "Ananya writes luxury travel and hospitality stories for Hotel Thamel Park & Spa, focusing on Kathmandu experiences and refined Nepali journeys.",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    social: {
      instagram: "https://instagram.com",
      linkedin: "https://linkedin.com",
    },
  },
  {
    id: "author-wellness",
    name: "Dr. Mira Thapa",
    designation: "Wellness Editor",
    bio: "Mira covers spa rituals, restorative travel, and wellness hospitality across Nepal.",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    social: { instagram: "https://instagram.com" },
  },
];

export const defaultArticleCategories: SiteContent["articleCategories"] = [
  { id: "cat-luxury", name: "Luxury Travel", slug: "luxury-travel", enabled: true, order: 0 },
  { id: "cat-guides", name: "Travel Guides", slug: "travel-guides", enabled: true, order: 1 },
  { id: "cat-experiences", name: "Experiences", slug: "experiences", enabled: true, order: 2 },
  { id: "cat-dining", name: "Dining", slug: "dining", enabled: true, order: 3 },
  { id: "cat-wellness", name: "Spa & Wellness", slug: "spa-wellness", enabled: true, order: 4 },
  { id: "cat-tips", name: "Travel Tips", slug: "travel-tips", enabled: true, order: 5 },
  { id: "cat-family", name: "Family Travel", slug: "family-travel", enabled: true, order: 6 },
  { id: "cat-romance", name: "Romance", slug: "romance", enabled: true, order: 7 },
  { id: "cat-business", name: "Business Travel", slug: "business-travel", enabled: true, order: 8 },
  { id: "cat-hotel", name: "Hotel Stories", slug: "hotel-stories", enabled: true, order: 9 },
];

export const defaultArticleTags: SiteContent["articleTags"] = [
  { id: "tag-kathmandu", name: "Kathmandu", slug: "kathmandu" },
  { id: "tag-thamel", name: "Thamel", slug: "thamel" },
  { id: "tag-luxury", name: "Luxury", slug: "luxury" },
  { id: "tag-hotels", name: "Hotels", slug: "hotels" },
  { id: "tag-travel", name: "Travel", slug: "travel" },
  { id: "tag-nepal", name: "Nepal", slug: "nepal" },
  { id: "tag-spa", name: "Spa", slug: "spa" },
  { id: "tag-wellness", name: "Wellness", slug: "wellness" },
  { id: "tag-dining", name: "Dining", slug: "dining" },
  { id: "tag-food", name: "Food", slug: "food" },
  { id: "tag-guide", name: "Guide", slug: "guide" },
  { id: "tag-experiences", name: "Experiences", slug: "experiences" },
  { id: "tag-tips", name: "Tips", slug: "tips" },
  { id: "tag-family", name: "Family", slug: "family" },
  { id: "tag-romance", name: "Romance", slug: "romance" },
  { id: "tag-business", name: "Business", slug: "business" },
  { id: "tag-meetings", name: "Meetings", slug: "meetings" },
  { id: "tag-itinerary", name: "Itinerary", slug: "itinerary" },
  { id: "tag-boutique", name: "Boutique", slug: "boutique" },
  { id: "tag-thamel-park", name: "Hotel Thamel Park", slug: "hotel-thamel-park" },
];

export function buildDefaultArticles(): Article[] {
  const baseDate = new Date("2026-03-01T10:00:00.000Z");
  return TOPICS.map((topic, i) => {
    const slug = slugify(topic.title);
    const body = articleHtml({
      intro: topic.intro,
      sections: topic.sections,
      cta: `Ready to experience Kathmandu with refined comfort? <a href="/book">Book your stay at Hotel Thamel Park &amp; Spa</a> or <a href="/contact">speak with our concierge</a> to craft a personalised itinerary.`,
      faq: topic.faq,
    });
    const toc = [
      ...topic.sections.map((s) => ({ id: s.id, label: s.title, level: 2 as const })),
      { id: "plan-your-stay", label: "Plan Your Stay", level: 2 as const },
      { id: "faq", label: "FAQ", level: 2 as const },
    ];
    const published = new Date(baseDate);
    published.setDate(published.getDate() + i * 3);
    const related = TOPICS.map((t) => slugify(t.title)).filter((s) => s !== slug).slice(0, 3);

    return {
      id: `article-${slug}`,
      slug,
      title: topic.title,
      excerpt: topic.excerpt,
      body,
      coverImage: COVERS[i % COVERS.length],
      coverAlt: `${topic.title} — Hotel Thamel Park editorial`,
      categoryId: topic.categoryId,
      tagIds: topic.tagIds,
      authorId: i % 2 === 0 ? "author-concierge" : "author-wellness",
      readingTime: 8 + (i % 5),
      publishedAt: published.toISOString(),
      status: "published" as const,
      featured: topic.featured === true,
      pinned: topic.pinned === true,
      allowComments: true,
      relatedIds: related.map((s) => `article-${s}`),
      seo: {
        title: `${topic.title} | Hotel Thamel Park & Spa`,
        description: topic.excerpt,
        keywords: topic.keywords,
        canonical: `/articles/${slug}`,
        ogImage: COVERS[i % COVERS.length],
      },
      faq: topic.faq.map((f) => ({ question: f.q, answer: f.a })),
      toc,
      revisions: [],
      order: i,
    };
  });
}

export const defaultArticlesPage: SiteContent["articlesPage"] = {
  hero: {
    title: "ARTICLES",
    subtitle: "Luxury Travel Journal",
    description:
      "Discover expert travel guides, luxury hotel insights, Kathmandu experiences, destination inspiration, hospitality stories and premium travel tips.",
    imageSrc: COVER,
    breadcrumbHome: "Home",
    breadcrumbCurrent: "Articles",
    overlayOpacity: 0.45,
    media: {
      type: "image",
      imageSrc: COVER,
      videoSrc: "",
      poster: "",
      alt: "Luxury travel journal cover",
      caption: "",
    },
  },
  seo: {
    title: "Articles | Luxury Travel Journal | Hotel Thamel Park & Spa",
    description:
      "Read luxury travel guides, Kathmandu hotel tips, spa insights, and destination stories from Hotel Thamel Park & Spa.",
    canonical: "/articles",
    ogImage: COVER,
    keywords:
      "kathmandu travel blog, luxury hotel articles, thamel travel tips, nepal hospitality journal",
  },
  eyebrow: "Editorial",
  title: "Latest Stories",
  description:
    "Thoughtfully written guides and hospitality stories for travellers who seek beauty, calm, and authenticity in Kathmandu.",
  sidebar: {
    searchPlaceholder: "Search articles…",
    categoriesTitle: "Categories",
    recentTitle: "Recent Posts",
    popularTitle: "Popular Posts",
    featuredTitle: "Featured",
    tagsTitle: "Tags",
    newsletterTitle: "Stay Inspired",
    newsletterDescription: "Receive curated travel notes and exclusive offers.",
    newsletterButton: "Subscribe",
  },
  newsletterCta: {
    title: "Join Our Travel Journal",
    description: "Luxury itineraries, spa rituals, and Kathmandu inspiration — delivered with care.",
    buttonText: "Subscribe",
  },
  goldColor: "#C5A059",
  headingColor: "#062C24",
  bodyColor: "#5A635C",
  backgroundTop: "#F9F6EF",
  backgroundBottom: "#E8F0E9",
};
