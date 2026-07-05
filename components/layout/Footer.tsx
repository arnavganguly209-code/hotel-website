"use client";

import type { SiteContent } from "@/lib/cms/types";
import { PremiumFooter } from "@/components/footer/PremiumFooter";

interface FooterProps {
  content: SiteContent;
}

export function Footer({ content }: FooterProps) {
  return <PremiumFooter content={content} />;
}
