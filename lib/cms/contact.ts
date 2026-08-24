import type { SiteContent } from "@/lib/cms/types";

export type SiteContact = {
  hotelName: string;
  phone: string;
  mobile: string;
  email: string;
  reservationEmail: string;
  enquiryEmail: string;
  whatsapp: string;
  address: string;
  hours: string;
  facebook: string;
  instagram: string;
  twitter: string;
  tripadvisor: string;
};

export function resolveSiteContact(content: SiteContent): SiteContact {
  const hotel = content.hotel;
  const footer = content.footer?.contact;
  const page = content.contactPage;
  const phone = hotel.phone || content.header?.phone || footer?.phone || page?.phone || "";
  const email = hotel.email || footer?.email || page?.email || "";
  return {
    hotelName: hotel.name,
    phone,
    mobile: hotel.mobile || phone,
    email,
    reservationEmail: hotel.reservationEmail || email,
    enquiryEmail: hotel.enquiryEmail || email,
    whatsapp: hotel.whatsapp || page?.whatsapp || phone,
    address: hotel.address || footer?.location || page?.address || hotel.location || "",
    hours: hotel.hours || footer?.frontDesk || "24/7 Front Desk",
    facebook: hotel.social?.facebook || "",
    instagram: hotel.social?.instagram || "",
    twitter: hotel.social?.twitter || "",
    tripadvisor: hotel.social?.tripadvisor || "",
  };
}
