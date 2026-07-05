import type { Metadata } from "next";
import { LegalContent } from "@/sections/pages/LegalContent";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${siteConfig.name}.`,
};

export default function PrivacyPage() {
  return (
    <LegalContent
      title="Privacy Policy"
      sections={[
        {
          heading: "Information We Collect",
          body: `${siteConfig.name} collects information you provide directly, including name, email, phone number, and booking details. This information is used to process reservations and enhance your guest experience.`,
        },
        {
          heading: "How We Use Your Data",
          body: "We use your personal information to process bookings, communicate with you, and improve our services. We do not sell or share your data with third parties except as necessary to provide our services.",
        },
        {
          heading: "Data Security",
          body: "All personal data is stored securely with appropriate technical and organizational safeguards to protect against unauthorized access.",
        },
        {
          heading: "Your Rights",
          body: `You may request access, correction, or deletion of your personal data by contacting us at ${siteConfig.email}.`,
        },
      ]}
    />
  );
}
