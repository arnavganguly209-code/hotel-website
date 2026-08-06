import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPageClient } from "@/sections/pages/LegalPageClient";
import { getContent } from "@/lib/cms/store";
import { buildBreadcrumbSchema, buildPageMetadata } from "@/lib/seo/page-metadata";
import {
  LEGAL_SECTIONS,
  legalSectionPath,
  type LegalSectionId,
} from "@/lib/navigation";

const SECTION_META: Record<
  LegalSectionId,
  { title: string; description: string }
> = {
  privacy: {
    title: "Privacy Policy",
    description:
      "How Hotel Thamel Park collects, uses, and protects your personal information when you browse or book with us.",
  },
  terms: {
    title: "Terms & Conditions",
    description:
      "Reservation terms, check-in policies, guest responsibilities, and liability for stays at Hotel Thamel Park.",
  },
  cancellation: {
    title: "Cancellation Policy",
    description:
      "Cancellation windows, refunds, no-show rules, and how to modify or cancel your Hotel Thamel Park booking.",
  },
  cookies: {
    title: "Cookie Settings",
    description:
      "How Hotel Thamel Park uses cookies and how you can manage preferences in your browser.",
  },
  sitemap: {
    title: "Sitemap",
    description:
      "Browse main pages on the Hotel Thamel Park website — rooms, dining, spa, gallery, and contact.",
  },
};

function isLegalSection(value: string): value is LegalSectionId {
  return (LEGAL_SECTIONS as readonly string[]).includes(value);
}

interface LegalSectionRouteProps {
  params: Promise<{ section: string }>;
}

export function generateStaticParams() {
  return LEGAL_SECTIONS.map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: LegalSectionRouteProps): Promise<Metadata> {
  const { section } = await params;
  if (!isLegalSection(section)) return { title: "Legal" };

  const content = await getContent();
  const meta = SECTION_META[section];
  const path = legalSectionPath(section);

  return buildPageMetadata(
    {
      title: `${meta.title} | ${content.hotel.name}`,
      description: meta.description,
      canonical: path,
    },
    path,
    content.hotel.name
  );
}

export default async function LegalSectionRoute({ params }: LegalSectionRouteProps) {
  const { section } = await params;
  if (!isLegalSection(section)) notFound();

  const meta = SECTION_META[section];
  const path = legalSectionPath(section);
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Legal", url: legalSectionPath("privacy") },
    { name: meta.title, url: path },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <LegalPageClient activeSection={section} />
    </>
  );
}
