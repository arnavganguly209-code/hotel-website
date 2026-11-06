/**
 * Search landing pages. They are indexable and listed in the XML sitemap,
 * and they are not added to the public header, footer, or homepage.
 */

export type AltPageLink = { href: string; label: string };

export type AltSeoPage = {
  slug: string;
  keyword: string;
  audience: "local" | "international";
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: { heading: string; body: string }[];
  faqs: { question: string; answer: string }[];
  links: AltPageLink[];
};

const BOOK = { href: "/rooms", label: "View rooms and book" };
const CONTACT = { href: "/contact", label: "Contact the hotel" };
const DINING = { href: "/dining", label: "Dining at the hotel" };
const SPA = { href: "/spa", label: "Spa and wellness" };
const MEET = { href: "/meetings-events", label: "Meetings and events" };
const ABOUT = { href: "/about", label: "About Hotel Thamel Park" };
const CULTURE = { href: "/cultural-experience", label: "Kathmandu cultural notes" };

export const ALT_SEO_PAGES: AltSeoPage[] = [
  {
    slug: "best-hotel-in-kathmandu",
    keyword: "best hotel in Kathmandu",
    audience: "international",
    title: "Best Hotel in Kathmandu for a Calm Stay | Hotel Thamel Park",
    description:
      "Looking for the best hotel in Kathmandu? Hotel Thamel Park puts rooms, dining, a spa, and Thamel’s lanes in one address, with a clear way to book.",
    h1: "Best hotel in Kathmandu",
    intro:
      "Travellers comparing the best hotel in Kathmandu usually want three things at once: a quiet room, food they can trust, and a location that does not waste the first day. Hotel Thamel Park sits in Thamel, the neighbourhood most visitors already use as their base for temples, trekking offices, and evening walks.",
    sections: [
      {
        heading: "Why guests shortlist this address",
        body: "The hotel is built for a Kathmandu stay rather than a generic city break. Rooms are set up for rest after a flight or a hill walk. The restaurant and lounge mean dinner does not require another taxi. A spa is on the same property when the schedule needs a slower afternoon. Staff can point you toward Durbar Square, Swayambhunath, and Boudhanath without turning the day into a scavenger hunt.",
      },
      {
        heading: "What to check before you book",
        body: "Read the room page for bed type and occupancy, then confirm dates on the booking form. If you are arriving late from Tribhuvan International Airport, write that on the contact form so the desk expects you. Couples, families, and small work groups can all stay here; the right room is the one that matches how many people are actually travelling.",
      },
    ],
    faqs: [
      {
        question: "Is Hotel Thamel Park a practical base for all of Kathmandu?",
        answer:
          "Yes. Thamel is the usual starting point for temple visits, trekking agencies, and restaurants, so most Kathmandu plans begin within a short ride or walk.",
      },
      {
        question: "Can I book a room directly?",
        answer: "Use the rooms page to choose dates and a room, or send a message from the contact page if you want the desk to confirm a detail first.",
      },
      {
        question: "Does the hotel include dining?",
        answer: "Yes. Dining is on the property, including the restaurant and lounge, so you are not dependent on going out for every meal.",
      },
    ],
    links: [BOOK, DINING, SPA, CONTACT],
  },
  {
    slug: "best-hotel-in-thamel",
    keyword: "best hotel in Thamel",
    audience: "international",
    title: "Best Hotel in Thamel, Kathmandu | Hotel Thamel Park",
    description:
      "The best hotel in Thamel is the one that stays quiet after the lanes get loud. Hotel Thamel Park offers rooms, dining, and a spa inside the neighbourhood.",
    h1: "Best hotel in Thamel",
    intro:
      "Thamel is Kathmandu’s traveller quarter: bookshops, bakeries, trekking counters, and a night market that does not really end. The best hotel in Thamel is not the one closest to the loudest corner. It is the one that lets you step into that energy and then close a door on it.",
    sections: [
      {
        heading: "Stay in the neighbourhood, not in the noise",
        body: "Hotel Thamel Park is in Thamel, so cafes, cash, and a taxi are close when you need them. Rooms are the point of the stay: a real bed, a private bathroom, and enough quiet to sleep before an early temple visit or a mountain flight. You can eat in the hotel or walk out for momos. Both are reasonable plans.",
      },
      {
        heading: "Who this suits",
        body: "First-time visitors who want Thamel without managing a guesthouse. Returning travellers who already know the lanes and want a more finished room. Families who need space and a desk that answers. If your plan is only a few nights between a trek and a flight, this is the simple version of that stay.",
      },
    ],
    faqs: [
      {
        question: "Is the hotel inside Thamel?",
        answer: "Yes. Hotel Thamel Park is a Thamel address, which is why it shows up when people search for a hotel in the neighbourhood.",
      },
      {
        question: "Is Thamel too busy for a good night’s sleep?",
        answer: "The lanes are busy. The hotel is the quiet part of the plan. Ask for a room away from the street if you are sensitive to sound.",
      },
      {
        question: "What else is on the property?",
        answer: "Dining, a lounge, and a spa sit with the rooms, so a full day does not have to be spent walking between venues.",
      },
    ],
    links: [BOOK, ABOUT, DINING, CONTACT],
  },
  {
    slug: "luxury-hotel-kathmandu",
    keyword: "luxury hotel Kathmandu",
    audience: "international",
    title: "Luxury Hotel in Kathmandu | Hotel Thamel Park Stay",
    description:
      "A luxury hotel in Kathmandu should feel finished, not fussy. Hotel Thamel Park pairs rooms, dining, a lounge, and a spa with a Thamel address.",
    h1: "Luxury hotel in Kathmandu",
    intro:
      "Luxury in Kathmandu is not a marble lobby copied from another city. It is hot water that works, a bed you want a second night in, food served with care, and someone at the desk who can sort a taxi without a speech. Hotel Thamel Park is built on that standard.",
    sections: [
      {
        heading: "Where the stay feels considered",
        body: "Rooms are dressed for rest, not for a photograph that hides a thin mattress. The restaurant and Skyz Lounge give the evening a place to land. The spa is for the hour when Kathmandu’s dust and stairs have added up. None of this requires leaving Thamel, which matters when the afternoon is already short.",
      },
      {
        heading: "A luxury stay that still works for a real itinerary",
        body: "You can walk to the parts of Thamel you came for and still come back to a property that feels looked after. Tell the hotel if you need an early breakfast before a flight to Lukla or Pokhara. The booking page shows the rooms; the contact page is there when a plan needs a person.",
      },
    ],
    faqs: [
      {
        question: "What makes this a luxury stay rather than a standard guesthouse?",
        answer:
          "Private rooms with a finished bathroom, on-site dining and a lounge, a spa, and a desk that handles the stay as hospitality rather than a bed for the night.",
      },
      {
        question: "Is luxury here formal?",
        answer: "No. The tone is calm and direct. You do not need a dress code to eat in the hotel.",
      },
      {
        question: "Can I see the rooms before I decide?",
        answer: "Yes. The rooms page lists the room types with the details you need to choose.",
      },
    ],
    links: [BOOK, SPA, DINING, ABOUT],
  },
  {
    slug: "boutique-hotel-thamel",
    keyword: "boutique hotel Thamel",
    audience: "international",
    title: "Boutique Hotel in Thamel | Hotel Thamel Park",
    description:
      "Hotel Thamel Park is a boutique hotel in Thamel for guests who want a smaller property, a real room, and Kathmandu within walking distance of the door.",
    h1: "Boutique hotel in Thamel",
    intro:
      "A boutique hotel in Thamel should be small enough that the desk recognises you on the second morning. Hotel Thamel Park is that kind of property: rooms, a restaurant, a lounge, and a spa, run as one hotel rather than a tower with a view of the ring road.",
    sections: [
      {
        heading: "Smaller on purpose",
        body: "You are not crossing a convention floor to reach the lift. The stay is the room, the meal, and the person who can tell you which temple gate is worth the morning. That scale is the point of choosing Thamel over a highway hotel on the edge of the valley.",
      },
      {
        heading: "Still complete",
        body: "Boutique does not mean unfinished. Book a room for the dates you need, eat in the dining room when the lanes are too much, and use the spa if the day was all stairs. Families and pairs both fit; check occupancy on the room you like.",
      },
    ],
    faqs: [
      {
        question: "Is a boutique hotel a good idea for a first trip to Kathmandu?",
        answer:
          "Yes, if you want a clear address in Thamel and a desk that will answer practical questions about temples, taxis, and timing.",
      },
      {
        question: "How do I reserve?",
        answer: "Choose a room on the rooms page, or write to the hotel from the contact page with your dates.",
      },
      {
        question: "Is dining only for guests?",
        answer: "Dining is part of the hotel. Use the dining page for the restaurant and lounge before you plan the evening.",
      },
    ],
    links: [BOOK, ABOUT, DINING, CONTACT],
  },
  {
    slug: "hotel-near-thamel-kathmandu",
    keyword: "hotel near Thamel Kathmandu",
    audience: "local",
    title: "Hotel near Thamel, Kathmandu | Hotel Thamel Park",
    description:
      "Need a hotel near Thamel in Kathmandu? Hotel Thamel Park is in the neighbourhood, with rooms, meals, and a spa so the day can start and end in one place.",
    h1: "Hotel near Thamel, Kathmandu",
    intro:
      "Searching for a hotel near Thamel usually means you want the neighbourhood’s restaurants and agencies without sleeping above a bar. Hotel Thamel Park is in Thamel itself, which is better than “near” if your days start with a walk and end with a short return.",
    sections: [
      {
        heading: "Why the location saves time",
        body: "Trekking offices, ATMs, pharmacies, and supper are in the surrounding lanes. Durbar Square, Swayambhunath, and Boudhanath are short rides, not half-day transfers. You spend the hour you saved in the room or at the table instead of in traffic on the way back from a distant hotel.",
      },
      {
        heading: "Staying put when you want to",
        body: "The restaurant, lounge, and spa mean a rainy afternoon does not require a plan. Book the room that matches your group, and send flight times through the contact form if you want the desk ready.",
      },
    ],
    faqs: [
      {
        question: "Is the hotel actually in Thamel or only nearby?",
        answer: "It is a Thamel hotel. The address is inside the neighbourhood people mean when they say Thamel.",
      },
      {
        question: "Can Nepali guests book as well as visitors?",
        answer: "Yes. The same rooms and the same booking page are open to local and international guests.",
      },
      {
        question: "How far are the main temples?",
        answer: "They are a short drive. The desk can help you order the day so you are not crossing the valley twice.",
      },
    ],
    links: [BOOK, CULTURE, CONTACT, ABOUT],
  },
  {
    slug: "kathmandu-hotel-with-spa",
    keyword: "Kathmandu hotel with spa",
    audience: "international",
    title: "Kathmandu Hotel with a Spa | Hotel Thamel Park",
    description:
      "Book a Kathmandu hotel with a spa on the same property. Hotel Thamel Park in Thamel pairs guest rooms with wellness time after a day of temples or travel.",
    h1: "Kathmandu hotel with a spa",
    intro:
      "A Kathmandu hotel with a spa is worth it when the treatment is in the building, not a booking across town. Hotel Thamel Park keeps the spa with the rooms, so a long day of stone steps can end without another ride through traffic.",
    sections: [
      {
        heading: "Rest that fits the city",
        body: "Kathmandu asks a lot of your legs. The spa is the counterweight: time, heat, and quiet on the same property as your bed. Read the spa page for what is offered, then hold the room first so the dates are yours.",
      },
      {
        heading: "A full stay, not only a treatment",
        body: "You still have a room, a restaurant, and the Thamel location. The spa is an addition to the stay, which is how it should work if you are here for the city and not only for a package.",
      },
    ],
    faqs: [
      {
        question: "Is the spa inside the hotel?",
        answer: "Yes. It is part of Hotel Thamel Park, so you are not travelling between a day room and a separate clinic.",
      },
      {
        question: "Should I book the room and the spa together?",
        answer: "Reserve the room on the rooms page, then use the spa page or the contact form to ask about a time.",
      },
      {
        question: "Is this suitable after a trek?",
        answer: "Yes. Many guests arrive tired. A room and a spa in Thamel is a straightforward way to land.",
      },
    ],
    links: [SPA, BOOK, CONTACT, DINING],
  },
  {
    slug: "family-hotel-kathmandu",
    keyword: "family hotel Kathmandu",
    audience: "international",
    title: "Family Hotel in Kathmandu | Hotel Thamel Park Rooms",
    description:
      "A family hotel in Kathmandu needs space and a simple location. Hotel Thamel Park in Thamel has rooms for sharing, meals downstairs, and the city close by.",
    h1: "Family hotel in Kathmandu",
    intro:
      "Travelling with children or parents changes the hotel question. A family hotel in Kathmandu has to offer a room that actually sleeps the group, food that does not require a negotiation every night, and a neighbourhood you can explain in one sentence. Thamel is that neighbourhood, and Hotel Thamel Park is set up for that stay.",
    sections: [
      {
        heading: "Rooms that match the group",
        body: "Look at occupancy before you fall for a photograph. Family trips fail when two people are quietly booked into a room for one. The rooms page lists what each room holds. If you are unsure, write the ages and the number of beds you need on the contact form and let the desk answer before you pay.",
      },
      {
        heading: "Days that do not exhaust everyone",
        body: "Keep one anchor in the hotel: breakfast or an early supper in the dining room, then one outing. Swayambhunath, the old city, or a short market walk is enough. The spa is there for the adults after the children are settled. You do not need a different hotel for each person.",
      },
    ],
    faqs: [
      {
        question: "Are there rooms for more than two guests?",
        answer: "Yes. Check the room list for occupancy. Choose the room that fits the family rather than splitting the group by accident.",
      },
      {
        question: "Is Thamel manageable with children?",
        answer: "It is busy. The hotel is the calm part. Plan shorter outings and come back for meals when the lanes feel like too much.",
      },
      {
        question: "Can we ask for a quieter room?",
        answer: "Yes. Say so on the booking note or the contact form and the desk will do what the house allows.",
      },
    ],
    links: [BOOK, DINING, CONTACT, CULTURE],
  },
  {
    slug: "romantic-hotel-kathmandu",
    keyword: "romantic hotel Kathmandu",
    audience: "international",
    title: "Romantic Hotel in Kathmandu | Hotel Thamel Park",
    description:
      "A romantic hotel in Kathmandu should feel private and easy. Hotel Thamel Park offers a quiet room, dinner in the house, and Thamel just outside when you want it.",
    h1: "Romantic hotel in Kathmandu",
    intro:
      "A romantic hotel in Kathmandu is a private room and a meal you do not have to hunt for. Hotel Thamel Park keeps both on one property in Thamel, with a lounge for a slower evening and a city that is interesting enough for two without becoming a group tour.",
    sections: [
      {
        heading: "An evening that stays simple",
        body: "Eat in the restaurant or the lounge instead of crossing town. Walk a few lanes if the night is clear. Come back to the same door. That rhythm is more romantic than a schedule of viewpoints and a late taxi argument.",
      },
      {
        heading: "A room with a reason to linger",
        body: "Book a room for two and, if you want it, time in the spa. Tell the desk if the stay is a celebration so they are not guessing. The contact page is the right place for that note.",
      },
    ],
    faqs: [
      {
        question: "Is this a good hotel for a couple?",
        answer: "Yes. The scale is small, dinner is in the building, and Thamel gives you somewhere to walk without a full-day transfer.",
      },
      {
        question: "Can we request a quieter room?",
        answer: "Yes. Add it to the booking or send it through the contact form.",
      },
      {
        question: "Is there somewhere to eat without leaving?",
        answer: "Yes. Use the dining page for the restaurant and lounge.",
      },
    ],
    links: [BOOK, DINING, SPA, CONTACT],
  },
  {
    slug: "hotel-near-kathmandu-durbar-square",
    keyword: "hotel near Kathmandu Durbar Square",
    audience: "local",
    title: "Hotel near Kathmandu Durbar Square | Hotel Thamel Park",
    description:
      "Stay at a hotel near Kathmandu Durbar Square without sleeping in the square. Hotel Thamel Park is a short ride away in Thamel, with rooms and dining.",
    h1: "Hotel near Kathmandu Durbar Square",
    intro:
      "Kathmandu Durbar Square is the old city’s public room: temples, the palace edge, and a square that is busy from morning. A hotel near Kathmandu Durbar Square should be close enough for a morning visit and far enough that you are not living inside the crowd. Hotel Thamel Park in Thamel is that distance.",
    sections: [
      {
        heading: "Visit the square, sleep in Thamel",
        body: "Go early, walk the square, and come back for a late breakfast or lunch at the hotel. You do not need a room overlooking a festival ground to have a serious old-city day. Thamel also puts the rest of your errands in reach once the square has done its work.",
      },
      {
        heading: "Plan the day in one piece",
        body: "Pair Durbar Square with a shorter stop rather than three monuments before noon. The cultural notes on the site are a useful primer. Book the room for the nights you need so the morning is not spent moving hotels.",
      },
    ],
    faqs: [
      {
        question: "How do I get to Durbar Square from the hotel?",
        answer: "It is a short ride or a longer walk, depending on traffic and your pace. The desk can help you leave at a sensible hour.",
      },
      {
        question: "Should I stay inside the square itself?",
        answer: "Most guests prefer a full hotel in Thamel and a dedicated visit to the square. You see it properly and you sleep properly.",
      },
      {
        question: "Can the hotel help with the order of sights?",
        answer: "Yes. Ask at the desk or write ahead from the contact page.",
      },
    ],
    links: [BOOK, CULTURE, CONTACT, ABOUT],
  },
  {
    slug: "hotel-near-swayambhunath",
    keyword: "hotel near Swayambhunath",
    audience: "local",
    title: "Hotel near Swayambhunath, Kathmandu | Hotel Thamel Park",
    description:
      "After the steps at Swayambhunath, stay somewhere finished. Hotel Thamel Park is a short ride from the stupa, with rooms, meals, and a spa in Thamel.",
    h1: "Hotel near Swayambhunath",
    intro:
      "Swayambhunath is a hill, a stupa, and a long stair. A hotel near Swayambhunath should make the return easy. Hotel Thamel Park is a short ride away in Thamel, which is the more useful base once you also want food, a pharmacy, or an early car to the airport.",
    sections: [
      {
        heading: "See the stupa, then stop moving",
        body: "Go in the morning, take the stairs slowly, and leave before the heat sits on the stone. Come back to a room that is ready, not to a search for lunch in a lane you do not know. If your knees have opinions, the spa is in the same hotel. Ask the desk for the simplest car back to Thamel.",
      },
      {
        heading: "Thamel as the rest of the plan",
        body: "One monument is not a whole Kathmandu stay. Thamel lets you add the old city or Boudhanath on another day without changing hotels. Book the nights together and keep the same room.",
      },
    ],
    faqs: [
      {
        question: "Is the hotel at the foot of Swayambhunath?",
        answer: "No. It is in Thamel, a short ride away, which is the better base for the rest of Kathmandu.",
      },
      {
        question: "Is the climb hard?",
        answer: "The main stairs are real stairs. Take your time, carry water, and do not plan a second monument the same morning if anyone in the group is unsteady.",
      },
      {
        question: "Can I eat at the hotel afterwards?",
        answer: "Yes. Dining is on the property.",
      },
    ],
    links: [BOOK, CULTURE, SPA, DINING],
  },
  {
    slug: "hotel-near-boudhanath",
    keyword: "hotel near Boudhanath",
    audience: "international",
    title: "Hotel near Boudhanath Stupa | Hotel Thamel Park",
    description:
      "Visit Boudhanath from a hotel that covers the rest of Kathmandu. Hotel Thamel Park in Thamel is a straightforward base for the stupa, rooms, and dinner.",
    h1: "Hotel near Boudhanath",
    intro:
      "Boudhanath is one of the great public spaces in the valley: the stupa, the circuit of shops, and the evening lamps. A hotel near Boudhanath is useful for that visit. Hotel Thamel Park is in Thamel, a direct ride away, and it is the better bedroom if your Kathmandu plan is wider than one neighbourhood.",
    sections: [
      {
        heading: "Give the stupa its own hour",
        body: "Arrive, walk the circle, and leave when you are done. Do not try to add Durbar Square to the same rush hour. Return to Thamel for supper in the hotel or a quiet walk. The room is the reason the day stays pleasant.",
      },
      {
        heading: "One hotel for the valley’s main sights",
        body: "Swayambhunath, the old city, and the airport all sit more naturally with a Thamel base than with a room that only serves Boudhanath. Keep the booking in one place.",
      },
    ],
    faqs: [
      {
        question: "How long does it take to reach Boudhanath?",
        answer: "It is a short drive from Thamel in normal traffic. Ask the desk to help you leave before the worst of the afternoon.",
      },
      {
        question: "Is it worth staying only beside the stupa?",
        answer: "Only if Boudhanath is your entire trip. For a wider Kathmandu stay, Thamel is the more flexible base.",
      },
      {
        question: "Where do I book?",
        answer: "On the rooms page of Hotel Thamel Park.",
      },
    ],
    links: [BOOK, CULTURE, CONTACT, DINING],
  },
  {
    slug: "hotel-near-pashupatinath",
    keyword: "hotel near Pashupatinath",
    audience: "local",
    title: "Hotel near Pashupatinath | Hotel Thamel Park, Kathmandu",
    description:
      "Visit Pashupatinath and sleep in Thamel. Hotel Thamel Park is a composed hotel near enough for the temple and complete enough for the rest of your Kathmandu stay.",
    h1: "Hotel near Pashupatinath",
    intro:
      "Pashupatinath is a working temple on the Bagmati, not a backdrop. A hotel near Pashupatinath should let you visit with respect and then return to a normal evening. Hotel Thamel Park in Thamel is a short ride away and a calmer place to sleep.",
    sections: [
      {
        heading: "Visit with enough time and then leave",
        body: "Dress modestly, follow the local rules, and do not treat the ghats as a photo set. An hour with attention is better than a rushed combination of three sacred sites. Come back to the hotel for a meal and a quiet room.",
      },
      {
        heading: "The rest of the stay stays easy",
        body: "Thamel covers food, a spa if you want one, and the other sights on different days. Book the room for the full stay so you are not packing between temples.",
      },
    ],
    faqs: [
      {
        question: "Is the hotel inside the temple area?",
        answer: "No. The hotel is in Thamel. The temple is a short ride, which is the right separation.",
      },
      {
        question: "What should I know before going?",
        answer: "It is an active religious place. Dress modestly, ask before you photograph people, and leave offerings and rituals to the people they belong to.",
      },
      {
        question: "Can the desk help me time the visit?",
        answer: "Yes. Ask when you arrive or write ahead.",
      },
    ],
    links: [BOOK, CULTURE, CONTACT, ABOUT],
  },
  {
    slug: "kathmandu-airport-hotel",
    keyword: "Kathmandu airport hotel",
    audience: "international",
    title: "Kathmandu Airport Hotel in Thamel | Hotel Thamel Park",
    description:
      "Landing in Kathmandu and want a real hotel, not a layover bed? Hotel Thamel Park is a direct ride from the airport, with rooms, food, and a quiet night.",
    h1: "Kathmandu airport hotel",
    intro:
      "A Kathmandu airport hotel is often a room beside the runway. That is fine for four hours. It is a poor way to start a week in the valley. Hotel Thamel Park is a direct ride from Tribhuvan International Airport and puts you in Thamel, where the rest of the trip actually happens.",
    sections: [
      {
        heading: "After the flight",
        body: "Tell the hotel your arrival time, especially if it is late. The ride from the airport is straightforward in normal traffic. A room, a shower, and food in the building beat a second journey out for supper. If you are leaving again at dawn for a mountain flight, say so. Early starts are normal here.",
      },
      {
        heading: "Better than sleeping at the terminal hotel",
        body: "You wake up in the neighbourhood you will use for temples, trekking offices, and dinner. One move from the airport is enough. Book the nights you need, including the arrival night, so you are not negotiating a room at midnight.",
      },
    ],
    faqs: [
      {
        question: "How far is the hotel from the airport?",
        answer: "It is a direct ride from Tribhuvan International Airport to Thamel. Time depends on traffic, so share your flight number if you want the desk watching for you.",
      },
      {
        question: "Do you hold rooms for late landings?",
        answer: "Write the arrival time on the booking or the contact form so the hotel knows the room is for a late guest.",
      },
      {
        question: "Is this only for transit?",
        answer: "No. It is a full hotel for the Kathmandu stay, and it also works for the night you land or the night before you fly out.",
      },
    ],
    links: [BOOK, CONTACT, DINING, ABOUT],
  },
  {
    slug: "couples-hotel-kathmandu",
    keyword: "couples hotel Kathmandu",
    audience: "international",
    title: "Couples Hotel in Kathmandu | Hotel Thamel Park",
    description:
      "A couples hotel in Kathmandu with a private room, dinner in the building, and Thamel outside. Hotel Thamel Park keeps the stay easy for two.",
    h1: "Couples hotel in Kathmandu",
    intro:
      "Two people do not need a resort schedule. A couples hotel in Kathmandu needs a good room, a table for dinner, and a city you can enter and leave on foot. Hotel Thamel Park is that stay: Thamel at the door, the lounge and restaurant inside, and no obligation to join anyone else’s plan.",
    sections: [
      {
        heading: "Keep the days short",
        body: "One sight in the morning, a long lunch, and an evening that does not involve a tour bus. Durbar Square or Swayambhunath is plenty. The spa is there if you both want an hour that is not about sightseeing.",
      },
      {
        heading: "Book it as a room for two",
        body: "Choose a double occupancy room and add a note if the dates mark something. The hotel can prepare for a celebration more easily when it knows. Everything else can stay unplanned.",
      },
    ],
    faqs: [
      {
        question: "Is the hotel suitable for a honeymoon night or an anniversary?",
        answer: "Yes. Tell the desk what the date is. The room, dinner, and spa are the parts that matter.",
      },
      {
        question: "Will we have to join group activities?",
        answer: "No. The stay is private. Outings are your own.",
      },
      {
        question: "Where should we eat?",
        answer: "Start with the hotel dining room or lounge. Walk out only if you want to.",
      },
    ],
    links: [BOOK, DINING, SPA, CONTACT],
  },
  {
    slug: "business-hotel-kathmandu",
    keyword: "business hotel Kathmandu",
    audience: "local",
    title: "Business Hotel in Kathmandu | Hotel Thamel Park",
    description:
      "A business hotel in Kathmandu for a short working stay. Hotel Thamel Park offers a proper room, meals, and meeting space without a long commute into Thamel.",
    h1: "Business hotel in Kathmandu",
    intro:
      "A business hotel in Kathmandu should let you work, eat, and sleep without inventing logistics. Hotel Thamel Park covers the night and the meal, and it can host a small meeting when the work needs a table rather than a lobby sofa.",
    sections: [
      {
        heading: "A stay that respects the schedule",
        body: "Arrive, confirm the room, and eat on the property so the evening is not a search. If you have an early meeting or a flight, say so. Thamel is a known address for colleagues coming across the city, which is simpler than directing people to an unmarked lane on the edge of the valley.",
      },
      {
        heading: "When the work needs a room, not a cafe",
        body: "Use the meetings page if you need a private table for a few people. For a solo working night, the guest room is enough. Book the dates directly and send the company details through the contact form if an invoice name matters.",
      },
    ],
    faqs: [
      {
        question: "Can I hold a small meeting at the hotel?",
        answer: "Yes. Read the meetings and events page and write to the hotel with the headcount and the hour.",
      },
      {
        question: "Is this practical for a one-night work trip?",
        answer: "Yes. A real room and a meal in Thamel is often easier than a distant airport hotel plus a morning drive.",
      },
      {
        question: "Can local companies reserve?",
        answer: "Yes. Use the rooms page or the contact form and include the billing name.",
      },
    ],
    links: [MEET, BOOK, CONTACT, DINING],
  },
  {
    slug: "meeting-hotel-kathmandu",
    keyword: "meeting hotel Kathmandu",
    audience: "local",
    title: "Meeting Hotel in Kathmandu | Hotel Thamel Park",
    description:
      "Host a meeting in Kathmandu at Hotel Thamel Park in Thamel. Private space, rooms if people are staying, and a desk that can confirm the details.",
    h1: "Meeting hotel in Kathmandu",
    intro:
      "A meeting hotel in Kathmandu fails when the room is a curtain pulled across a restaurant at noon. Hotel Thamel Park takes meetings as a proper request: tell the hotel how many people, how long, and whether anyone needs a bedroom the same night.",
    sections: [
      {
        heading: "What to send with the enquiry",
        body: "Date, start time, headcount, and whether you need a projector, tea, or a seated lunch. The meetings page is the overview. The contact form is where the actual plan should go. If guests are staying, book their rooms at the same time so the house is not guessing.",
      },
      {
        heading: "Why Thamel works for a city meeting",
        body: "People can reach it. They can eat after. Nobody is stranded on a highway waiting for the session to be worth the drive. Keep the group small enough for the space you reserved.",
      },
    ],
    faqs: [
      {
        question: "Do you host meetings and small events?",
        answer: "Yes. Start with the meetings and events page, then confirm the date in writing.",
      },
      {
        question: "Can attendees stay in the hotel?",
        answer: "Yes. Reserve rooms for the people who need them so the meeting and the night are one plan.",
      },
      {
        question: "Who should I write to?",
        answer: "Use the contact page and include the meeting details in the message.",
      },
    ],
    links: [MEET, CONTACT, BOOK, DINING],
  },
  {
    slug: "wedding-hotel-kathmandu",
    keyword: "wedding hotel Kathmandu",
    audience: "local",
    title: "Wedding Hotel in Kathmandu | Hotel Thamel Park Events",
    description:
      "Planning a wedding gathering in Kathmandu? Hotel Thamel Park can discuss rooms and an event on one property in Thamel. Start with a written enquiry.",
    h1: "Wedding hotel in Kathmandu",
    intro:
      "A wedding hotel in Kathmandu has to be honest about size. Hotel Thamel Park is a boutique property in Thamel, which suits a smaller gathering, a family stay, and a meal more than a ballroom for the whole city. If that is the wedding you are planning, the conversation is worth having.",
    sections: [
      {
        heading: "Start with numbers, not a mood board",
        body: "Write the date, the number of guests, and how many rooms you need overnight. The hotel can say yes or no quickly when those three facts are in the first message. The meetings and events page explains the kinds of gatherings the house considers.",
      },
      {
        heading: "Rooms for the people who travel in",
        body: "Families coming from outside the valley need beds, not only a venue. Book the room block with the event so nobody is sent to a different neighbourhood after the meal. Dining can sit with the plan; confirm it rather than assuming.",
      },
    ],
    faqs: [
      {
        question: "Can the hotel host a wedding?",
        answer: "Smaller celebrations and family gatherings can be discussed. Send the guest count and the date. The hotel will tell you if the house can hold it.",
      },
      {
        question: "Can out-of-town family stay on site?",
        answer: "Yes, subject to the rooms available on those dates. Ask for the rooms and the event together.",
      },
      {
        question: "Where do I begin?",
        answer: "Read the meetings page, then use the contact form with the date and numbers.",
      },
    ],
    links: [MEET, CONTACT, BOOK, DINING],
  },
  {
    slug: "rooftop-hotel-kathmandu",
    keyword: "rooftop hotel Kathmandu",
    audience: "international",
    title: "Rooftop Hotel in Kathmandu | Hotel Thamel Park Lounge",
    description:
      "Want a rooftop evening in Kathmandu without a separate booking? Hotel Thamel Park’s lounge sits with the rooms in Thamel, so dinner can stay in the house.",
    h1: "Rooftop hotel in Kathmandu",
    intro:
      "A rooftop hotel in Kathmandu is really a question about the evening: where do you sit when the valley cools down? Hotel Thamel Park answers it inside the property. The lounge is part of the hotel, not a trek across Thamel for a table you might not get.",
    sections: [
      {
        heading: "Evening in the building",
        body: "Use the dining page to see the restaurant and lounge before you decide the night. Stay long enough to sit down. A rooftop plan fails when it is squeezed between two monuments and a flight. Give it the evening.",
      },
      {
        heading: "The room is still the point",
        body: "The view is a pleasure. The bed is why you booked. Choose the room on the rooms page and treat the lounge as part of the same stay, not a separate attraction you have to commute to.",
      },
    ],
    faqs: [
      {
        question: "Is there a lounge at the hotel?",
        answer: "Yes. Skyz Lounge is part of Hotel Thamel Park. See the dining page for how the evening is set up.",
      },
      {
        question: "Do I need a second reservation for the evening?",
        answer: "Ask the hotel when you book the room if you want a table held. Do not assume a walk-in on a busy night.",
      },
      {
        question: "Is this in Thamel?",
        answer: "Yes. The hotel, the rooms, and the lounge are on the Thamel property.",
      },
    ],
    links: [DINING, BOOK, CONTACT, ABOUT],
  },
  {
    slug: "thamel-hotel-with-restaurant",
    keyword: "Thamel hotel with restaurant",
    audience: "local",
    title: "Thamel Hotel with a Restaurant | Hotel Thamel Park",
    description:
      "Stay at a Thamel hotel with a restaurant on site. Hotel Thamel Park serves meals in the house, with rooms upstairs and the neighbourhood outside.",
    h1: "Thamel hotel with a restaurant",
    intro:
      "Thamel has more restaurants than you can try. A Thamel hotel with a restaurant still matters on the night you land, the morning you leave, and the rainy afternoon when you want a table without a hunt. Hotel Thamel Park keeps that table in the building.",
    sections: [
      {
        heading: "Eat in, walk out when you choose",
        body: "The dining room and lounge cover the meal you do not want to gamble on. The lanes cover the meal you do. Read the dining page so you know what the hotel actually serves, including the restaurant guests ask about, and then book the room around the days you are really here.",
      },
      {
        heading: "Useful for more than tourists",
        body: "Local guests use the hotel the same way: a room for family coming in, a meal that is already decided, and an address people can find. Reserve on the rooms page or ask the desk if you are booking for someone else.",
      },
    ],
    faqs: [
      {
        question: "Is there a restaurant in the hotel?",
        answer: "Yes. Dining is part of Hotel Thamel Park. The dining page describes it.",
      },
      {
        question: "Do I have to eat every meal in the hotel?",
        answer: "No. It is there when you want it. Thamel is outside when you do not.",
      },
      {
        question: "Can I ask about a group meal?",
        answer: "Yes. Use the contact page and include the number of people and the time.",
      },
    ],
    links: [DINING, BOOK, CONTACT, ABOUT],
  },
  {
    slug: "where-to-stay-in-thamel",
    keyword: "where to stay in Thamel",
    audience: "international",
    title: "Where to Stay in Thamel | Hotel Thamel Park",
    description:
      "Deciding where to stay in Thamel? Hotel Thamel Park is a complete hotel in the neighbourhood: rooms, dining, a lounge, and a spa, with a direct way to book.",
    h1: "Where to stay in Thamel",
    intro:
      "Where to stay in Thamel comes down to how finished you want the night to be. A guesthouse is fine if you want the cheapest bed and you already know the city. A hotel is the better answer if you want a private bathroom, a meal you can count on, and a desk that will still be there in the morning. Hotel Thamel Park is that hotel.",
    sections: [
      {
        heading: "The decision in plain terms",
        body: "Stay here if you want Thamel as your base for Kathmandu and you want the property itself to be calm. The rooms, the restaurant, the lounge, and the spa are the offer. You can ignore the spa and still have the right hotel. You should not ignore the room type. Match it to the number of people.",
      },
      {
        heading: "What you can do from the door",
        body: "Walk for coffee, a SIM card, or a trekking conversation. Ride to the stupas and the old city. Return without changing neighbourhoods. That is the whole argument for Thamel, and it only works if the room is good enough to return to.",
      },
    ],
    faqs: [
      {
        question: "Is Thamel the right area for a first visit?",
        answer: "For most first visits, yes. It is where travellers stay because food, help, and transport are close.",
      },
      {
        question: "What should I book?",
        answer: "A room at Hotel Thamel Park for the nights you are in the valley, including arrival and departure if those days are tight.",
      },
      {
        question: "Where are the room details?",
        answer: "On the rooms page, with a booking form so you are not writing dates into an email by accident.",
      },
    ],
    links: [BOOK, ABOUT, DINING, CULTURE],
  },
  {
    slug: "hotel-near-garden-of-dreams",
    keyword: "hotel near Garden of Dreams",
    audience: "local",
    title: "Hotel near Garden of Dreams | Hotel Thamel Park",
    description:
      "The Garden of Dreams sits beside Thamel. Stay at Hotel Thamel Park and walk over when you want the garden, then come back to a proper room.",
    h1: "Hotel near Garden of Dreams",
    intro:
      "The Garden of Dreams is the quiet garden at the edge of noisy Thamel. A hotel near Garden of Dreams lets you use it as a pause, not as a pilgrimage. Hotel Thamel Park is in the same part of the city, so the garden can be an hour in the day rather than the reason you crossed Kathmandu.",
    sections: [
      {
        heading: "An hour in the garden, a night in the hotel",
        body: "Go when you want shade and a slower walk. Then eat at the hotel or keep the evening for the lounge. The garden is a pleasure. It is not a place to base a whole Kathmandu trip by itself, which is why the hotel in Thamel does the real work.",
      },
      {
        heading: "Easy to add to any stay",
        body: "You do not need a special package. Book the room, walk to the garden on the afternoon that is free, and leave the rest of the plan open. Families and couples both use it this way.",
      },
    ],
    faqs: [
      {
        question: "Can I walk to the Garden of Dreams?",
        answer: "It is close to Thamel. Ask the desk for the simplest walking route on the day, because the lanes reward a local instruction.",
      },
      {
        question: "Is the garden the main reason to book?",
        answer: "No. The hotel is the stay. The garden is a good hour beside it.",
      },
      {
        question: "Where do I reserve a room?",
        answer: "On the rooms page.",
      },
    ],
    links: [BOOK, CULTURE, DINING, CONTACT],
  },
  {
    slug: "kathmandu-hotel-for-tourists",
    keyword: "Kathmandu hotel for tourists",
    audience: "international",
    title: "Kathmandu Hotel for Tourists | Hotel Thamel Park",
    description:
      "A Kathmandu hotel for tourists who want Thamel, a real room, and help with the obvious sights. Hotel Thamel Park is built for that first, clear stay.",
    h1: "Kathmandu hotel for tourists",
    intro:
      "A Kathmandu hotel for tourists should assume you have not been here before and should not talk down to you. Hotel Thamel Park starts from a simple brief: sleep well in Thamel, eat when you need to, and get a straight answer about how to see the city without collecting five unneeded excursions.",
    sections: [
      {
        heading: "A first stay that stays legible",
        body: "The neighbourhood is the one every guide already names. The hotel is the part that should feel finished. Use the cultural page as a primer, then ask the desk which sight fits the hours you actually have. Two well-paced days beat a checklist that ends in a headache.",
      },
      {
        heading: "Before you fly",
        body: "Book the room, including the night you land. Carry the hotel name for the airport taxi. If your international flight arrives late, send the time. The rest can be decided after a shower.",
      },
    ],
    faqs: [
      {
        question: "Is this a good first hotel in Kathmandu?",
        answer: "Yes. Thamel is the usual base, and the hotel covers room, food, and a person to ask.",
      },
      {
        question: "Do I need a tour package?",
        answer: "No. Book the room and build the days. Add a guide only for the outing that truly needs one.",
      },
      {
        question: "Which page do I use to reserve?",
        answer: "The rooms page. Use contact if you want a person to confirm a detail first.",
      },
    ],
    links: [BOOK, CULTURE, CONTACT, ABOUT],
  },
  {
    slug: "thamel-hotel-with-breakfast",
    keyword: "Thamel hotel with breakfast",
    audience: "international",
    title: "Thamel Hotel with Breakfast | Hotel Thamel Park",
    description:
      "Start the day in the building. Hotel Thamel Park is a Thamel hotel with breakfast and a full restaurant, so the morning does not begin with a search.",
    h1: "Thamel hotel with breakfast",
    intro:
      "A Thamel hotel with breakfast is the difference between a calm morning and a hunt for eggs before a temple opens. Hotel Thamel Park serves food in the house. Confirm breakfast when you book so the expectation matches the rate you chose.",
    sections: [
      {
        heading: "Why breakfast belongs in the booking",
        body: "Early cars, mountain flights, and old-city walks all start before the lanes are useful. Eating downstairs removes one decision. If you are leaving before the kitchen’s usual hour, say so the night before rather than discovering it at dawn.",
      },
      {
        heading: "The rest of the meals",
        body: "The restaurant is not only a breakfast room. Use it for supper when you are done walking. The dining page tells you more than a keyword can. Book the room for the whole stay so breakfast is in the same place each morning.",
      },
    ],
    faqs: [
      {
        question: "Is breakfast served at the hotel?",
        answer: "Yes. Confirm it is included in the rate you book, or ask the desk to add it, so there is no surprise.",
      },
      {
        question: "Can I get an early breakfast?",
        answer: "Ask when you arrive if you have an early flight or departure. The kitchen needs the request the evening before.",
      },
      {
        question: "Where do I see the room options?",
        answer: "On the rooms page.",
      },
    ],
    links: [DINING, BOOK, CONTACT, ABOUT],
  },
  {
    slug: "kathmandu-city-center-hotel",
    keyword: "Kathmandu city center hotel",
    audience: "local",
    title: "Kathmandu City Center Hotel | Hotel Thamel Park",
    description:
      "For a Kathmandu city center hotel, stay in Thamel. Hotel Thamel Park puts rooms, dining, and the neighbourhood’s errands in the part of the city people actually use.",
    h1: "Kathmandu city center hotel",
    intro:
      "Kathmandu does not have a single glass downtown. The practical city center for visitors and for many local plans is Thamel and the old city beside it. A Kathmandu city center hotel should be there. Hotel Thamel Park is.",
    sections: [
      {
        heading: "Central means useful",
        body: "You can reach Durbar Square, send someone to a meeting, find a pharmacy, and eat without a highway. That is the working definition of central in this valley. A hotel on the ring road can be quieter and still cost you an hour each way. Spend that hour in the room instead.",
      },
      {
        heading: "Book the center, then stop moving hotels",
        body: "One property for the Kathmandu nights is enough. Use it between a trek, a flight, or a family visit. The rooms page is the booking path. The contact page is for the question the form does not ask.",
      },
    ],
    faqs: [
      {
        question: "Is Thamel considered central Kathmandu?",
        answer: "For travellers and for most valley plans, yes. It is the neighbourhood people can find and the one that connects to the old city.",
      },
      {
        question: "Is a central hotel noisy?",
        answer: "The streets can be. Ask for a quieter room and keep the windows in mind. The hotel is still calmer than a room over a bar.",
      },
      {
        question: "Who is this stay for?",
        answer: "Anyone who wants Kathmandu time to be short on commuting: visitors, families, and local guests hosting people from outside the valley.",
      },
    ],
    links: [BOOK, ABOUT, CONTACT, CULTURE],
  },
  {
    slug: "hotel-for-international-travelers-kathmandu",
    keyword: "hotel for international travelers Kathmandu",
    audience: "international",
    title: "Hotel for International Travelers in Kathmandu | Thamel Park",
    description:
      "Hotel Thamel Park is a clear hotel for international travelers in Kathmandu: a Thamel address, rooms you can book online, meals, and help after a long flight.",
    h1: "Hotel for international travelers in Kathmandu",
    intro:
      "International travelers arrive tired, often at an awkward hour, with a valley itinerary that starts too soon. A hotel for international travelers in Kathmandu should be easy to name at the airport, easy to book before you fly, and complete enough that the first night does not require local knowledge. Hotel Thamel Park is set up for that landing.",
    sections: [
      {
        heading: "From the airport to a known door",
        body: "Use the hotel name with the taxi. Send the flight time if you want the desk to expect you. The room should be the first calm room of the trip, not a temporary bed you replace tomorrow. Eat in the hotel if the hour is late. Thamel will still be there in the morning.",
      },
      {
        heading: "English, dates, and a real booking",
        body: "Reserve on the rooms page in advance. Write questions in the contact form: extra bed, late arrival, early breakfast, a quieter room. You should not need a fixer to sleep well in Kathmandu.",
      },
    ],
    faqs: [
      {
        question: "Can I book from overseas before I fly?",
        answer: "Yes. Use the rooms page and keep the confirmation with your travel documents.",
      },
      {
        question: "What should I tell the airport taxi?",
        answer: "Hotel Thamel Park, Thamel. If you are unsure, show the confirmation on your phone.",
      },
      {
        question: "Is the hotel used to international guests?",
        answer: "Yes. Thamel is Kathmandu’s international neighbourhood, and the hotel is built for those arrivals.",
      },
    ],
    links: [BOOK, CONTACT, ABOUT, DINING],
  },
  {
    slug: "luxury-spa-hotel-thamel",
    keyword: "luxury spa hotel Thamel",
    audience: "international",
    title: "Luxury Spa Hotel in Thamel | Hotel Thamel Park",
    description:
      "A luxury spa hotel in Thamel for the day your legs are done. Hotel Thamel Park keeps the spa, the room, and dinner on one property.",
    h1: "Luxury spa hotel in Thamel",
    intro:
      "A luxury spa hotel in Thamel is the right search if you want the treatment and the bedroom in the same building. Hotel Thamel Park is that combination: a spa, a finished room, and a meal that does not send you back into the lanes unless you want to go.",
    sections: [
      {
        heading: "Use the spa as part of the stay",
        body: "Read the spa page, then ask for a time once the room is held. Do not build the whole day around a treatment you have not confirmed. The luxury is the lack of rushing: room, food, and an hour of quiet, in that order.",
      },
      {
        heading: "Who books this",
        body: "Guests ending a trek, couples who want one unrushed afternoon, and anyone who has already walked the old city and would like the next day to be softer. The hotel is still in Thamel, so the city remains available.",
      },
    ],
    faqs: [
      {
        question: "Is the spa on site in Thamel?",
        answer: "Yes. It is part of Hotel Thamel Park, not a separate appointment across the city.",
      },
      {
        question: "Do I need to book the spa before I arrive?",
        answer: "The room should be booked first. Ask about the spa through the contact page or at the desk so the time is real.",
      },
      {
        question: "Can I stay without using the spa?",
        answer: "Yes. The room and the restaurant stand on their own.",
      },
    ],
    links: [SPA, BOOK, DINING, CONTACT],
  },
  {
    slug: "best-place-to-stay-in-kathmandu",
    keyword: "best place to stay in Kathmandu",
    audience: "international",
    title: "Best Place to Stay in Kathmandu | Hotel Thamel Park",
    description:
      "The best place to stay in Kathmandu for most trips is Thamel. Hotel Thamel Park gives you the room, the meals, and the neighbourhood in one booking.",
    h1: "Best place to stay in Kathmandu",
    intro:
      "The best place to stay in Kathmandu is the base you will not want to change on night two. For most trips that base is Thamel, and the hotel should be good enough that the neighbourhood is a bonus rather than a compensation. Hotel Thamel Park is the straightforward choice: a real room, food in the building, and the city arranged around it.",
    sections: [
      {
        heading: "Compare it on the stay, not the slogan",
        body: "Look at where you will sleep, where you will eat on a tired night, and how hard it is to reach the airport and the main sights. This hotel answers those three with Thamel, an in-house restaurant, and a desk that handles ordinary requests. That is more useful than a longer list of amenities you will not use.",
      },
      {
        heading: "Book once",
        body: "Choose the room, include every night you are in the valley, and write down anything odd about the arrival. Changing hotels mid-stay is how Kathmandu trips get worse. The rooms page is enough to begin.",
      },
    ],
    faqs: [
      {
        question: "Why do so many people stay in Thamel?",
        answer: "Because food, transport, and help are concentrated there. It is the practical center of a Kathmandu visit.",
      },
      {
        question: "Is this the right hotel if I want quiet luxury?",
        answer: "Yes, if you want a finished boutique hotel rather than a large resort outside the city. Ask for a quieter room.",
      },
      {
        question: "How do I book?",
        answer: "Use the rooms page, or the contact page if you want to ask a question first.",
      },
    ],
    links: [BOOK, ABOUT, DINING, CONTACT],
  },
  {
    slug: "kathmandu-hotel-near-asan",
    keyword: "Kathmandu hotel near Asan",
    audience: "local",
    title: "Kathmandu Hotel near Asan Bazaar | Hotel Thamel Park",
    description:
      "Stay near Asan without living above the market. Hotel Thamel Park is a short walk or ride from the bazaar, with a quiet room to return to.",
    h1: "Kathmandu hotel near Asan",
    intro:
      "Asan is the market heart of the old city: spice, oil, and a crowd that knows where it is going. A Kathmandu hotel near Asan should let you walk into that and then leave it. Hotel Thamel Park is close enough for a market morning and complete enough that you are not sleeping in a storeroom above a shop.",
    sections: [
      {
        heading: "Use the market, then stop",
        body: "Go early, buy what you came for, and return before you are deciding meals while standing in a lane. The hotel restaurant is the easier lunch. Thamel also gives you the rest of the traveller services Asan does not exist to provide.",
      },
      {
        heading: "A local stay as much as a visitor stay",
        body: "Families in the valley use a hotel like this when relatives are in town and the house is full. The booking is the same. Pick the room that fits the number of people and write ahead if you need a particular setup.",
      },
    ],
    faqs: [
      {
        question: "How close is Asan?",
        answer: "It is a short walk or a very short ride from Thamel, depending on where you enter the market. The desk can point you.",
      },
      {
        question: "Is the market a reason to stay inside it?",
        answer: "Only if you want the noise. Most people prefer a hotel in Thamel and a purposeful visit to Asan.",
      },
      {
        question: "Can I book for family visiting Kathmandu?",
        answer: "Yes. Use the rooms page and include the names and dates in the request.",
      },
    ],
    links: [BOOK, CULTURE, DINING, CONTACT],
  },
  {
    slug: "quiet-hotel-in-thamel",
    keyword: "quiet hotel in Thamel",
    audience: "international",
    title: "A Quiet Hotel in Thamel | Hotel Thamel Park",
    description:
      "Looking for a quiet hotel in Thamel? Hotel Thamel Park is the calm room inside a busy neighbourhood, with dining and a spa when you do not want to go out.",
    h1: "Quiet hotel in Thamel",
    intro:
      "A quiet hotel in Thamel sounds like a contradiction if you have only seen the main lanes at night. The neighbourhood is busy. The hotel does not have to be. Hotel Thamel Park is the place you close the door, eat if you want to eat, and sleep before the city starts again.",
    sections: [
      {
        heading: "Ask for quiet when you book",
        body: "Say that you want a room away from the street. The hotel can only place you where a room is free, but it cannot guess. A written note on the booking or the contact form is better than a hope at check-in when the house is full.",
      },
      {
        heading: "Stay in when the lanes are too much",
        body: "Dinner in the restaurant and an hour in the spa are how you keep a Thamel address without living in Thamel’s evening. You still have the location for the morning, which is when the neighbourhood is at its best.",
      },
    ],
    faqs: [
      {
        question: "Can a Thamel hotel actually be quiet?",
        answer: "The streets are not quiet. A room set back from them can be. Request it when you book.",
      },
      {
        question: "What if I am a light sleeper?",
        answer: "Say so. Bring what you usually travel with, and keep the plan for the evening inside the hotel if the lanes are loud.",
      },
      {
        question: "Is the spa useful on a quiet night?",
        answer: "Yes. It is in the building. Ask for a time rather than assuming one is open at the last minute.",
      },
    ],
    links: [BOOK, SPA, DINING, CONTACT],
  },
  {
    slug: "kathmandu-hotel-with-lounge",
    keyword: "Kathmandu hotel with lounge",
    audience: "international",
    title: "Kathmandu Hotel with a Lounge | Hotel Thamel Park",
    description:
      "Hotel Thamel Park is a Kathmandu hotel with a lounge for the evening, plus rooms and a restaurant in Thamel so the night stays in one place.",
    h1: "Kathmandu hotel with a lounge",
    intro:
      "A Kathmandu hotel with a lounge is what you want when the day was full and the night should be easy. Hotel Thamel Park’s lounge sits with the rooms and the restaurant. You can come down, sit, and eat without negotiating Thamel after dark.",
    sections: [
      {
        heading: "An evening with a shape",
        body: "Use the lounge as the end of the day, not as a stop between two other plans. Look at the dining page so you know it is part of this hotel. If you want a table at a particular hour, ask when you book the room.",
      },
      {
        heading: "Still a place to sleep",
        body: "The lounge is not the whole offer. The room is. Book it properly, especially on weekends and in the busy trekking months, and treat the evening as something the hotel can host because you are already a guest.",
      },
    ],
    faqs: [
      {
        question: "Which lounge is at the hotel?",
        answer: "Skyz Lounge is part of Hotel Thamel Park. Details sit on the dining page.",
      },
      {
        question: "Can I spend the evening in the hotel?",
        answer: "Yes. That is one of the reasons to choose a full hotel in Thamel rather than a room only.",
      },
      {
        question: "How do I reserve?",
        answer: "Book the room first on the rooms page, and mention the lounge if you need a table held.",
      },
    ],
    links: [DINING, BOOK, CONTACT, ABOUT],
  },
];

export function altPagePath(slug: string) {
  return `/guides/${slug}`;
}

export function getAltPage(slug: string) {
  return ALT_SEO_PAGES.find((page) => page.slug === slug);
}

export type AltPageCheck = { label: string; ok: boolean };

export function scoreAltPage(page: AltSeoPage): { score: number; checks: AltPageCheck[] } {
  const text = [page.intro, ...page.sections.map((s) => `${s.heading} ${s.body}`), ...page.faqs.map((f) => `${f.question} ${f.answer}`)].join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const titleLen = page.title.length;
  const descLen = page.description.length;
  const checks: AltPageCheck[] = [
    { label: "Unique slug", ok: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug) },
    {
      label: "Keyword in title",
      ok: page.keyword
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .every((word) => `${page.title} ${page.h1}`.toLowerCase().includes(word)),
    },
    { label: "Title length", ok: titleLen >= 42 && titleLen <= 68 },
    { label: "Description length", ok: descLen >= 120 && descLen <= 180 },
    { label: "Single H1", ok: page.h1.trim().length > 8 },
    { label: "Two content sections", ok: page.sections.length >= 2 && page.sections.every((s) => s.body.split(/\s+/).length >= 28) },
    { label: "Three FAQs", ok: page.faqs.length >= 3 },
    { label: "Internal links", ok: page.links.length >= 3 && page.links.every((l) => l.href.startsWith("/")) },
    { label: "Enough copy", ok: words >= 160 },
    { label: "Indexable path", ok: altPagePath(page.slug).startsWith("/guides/") },
  ];
  const passed = checks.filter((c) => c.ok).length;
  return { score: Math.round((passed / checks.length) * 100), checks };
}

export function altPagesAudit() {
  const slugs = new Set<string>();
  const titles = new Set<string>();
  const issues: string[] = [];
  for (const page of ALT_SEO_PAGES) {
    if (slugs.has(page.slug)) issues.push(`duplicate slug ${page.slug}`);
    slugs.add(page.slug);
    if (titles.has(page.title)) issues.push(`duplicate title ${page.title}`);
    titles.add(page.title);
    const { score, checks } = scoreAltPage(page);
    if (score < 100) {
      issues.push(`${page.slug} ${score}: ${checks.filter((c) => !c.ok).map((c) => c.label).join(", ")}`);
    }
  }
  if (ALT_SEO_PAGES.length < 25) issues.push(`only ${ALT_SEO_PAGES.length} pages`);
  return { count: ALT_SEO_PAGES.length, issues };
}
