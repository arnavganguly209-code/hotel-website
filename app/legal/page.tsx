import type { Metadata } from "next";
import { LegalPageClient } from "@/sections/pages/LegalPageClient";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Legal Information",
  description: `Privacy, terms, cancellation, cookies, and sitemap for ${siteConfig.name}.`,
};

export default function LegalPage() {
  return <LegalPageClient />;
}
