import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { ContactPage } from "@/sections/pages/ContactPage";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    title: "Contact & Reservations",
    description: `Contact ${content.hotel.name} for reservations, inquiries, and bespoke arrangements.`,
  };
}

export default async function ContactRoute() {
  const content = await getContent();

  return (
    <>
      <InnerPageHero
        title={content.contact.title}
        subtitle={content.contact.eyebrow}
        description={content.contact.description}
        imageSrc={content.gallery[0]?.src}
        height="medium"
      />
      <ContactPage content={content} />
    </>
  );
}
