import type { Metadata } from "next";
import { LegalContent } from "@/sections/pages/LegalContent";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms and conditions for ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <LegalContent
      title="Terms & Conditions"
      sections={[
        {
          heading: "Reservations",
          body: "All bookings are subject to availability and confirmation. Rates are quoted in USD and may vary by season.",
        },
        {
          heading: "Check-In & Check-Out",
          body: "Check-in begins at 2:00 PM. Check-out is at 12:00 PM. Early check-in and late check-out are subject to availability.",
        },
        {
          heading: "Cancellation Policy",
          body: "Cancellations made 48 hours prior to arrival receive a full refund. Cancellations within 48 hours may incur one night's charge.",
        },
        {
          heading: "Guest Responsibilities",
          body: "Guests are responsible for any damage to hotel property during their stay. The hotel reserves the right to refuse service for policy violations.",
        },
      ]}
    />
  );
}
