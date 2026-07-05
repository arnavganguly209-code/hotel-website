"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { FooterBrand } from "@/components/footer/FooterBrand";
import { FooterQuickLinks } from "@/components/footer/FooterQuickLinks";
import { FooterContact } from "@/components/footer/FooterContact";
import { FooterNewsletter } from "@/components/footer/FooterNewsletter";
import { FooterGalleryPreview } from "@/components/footer/FooterGalleryPreview";
import { FooterPaymentBar } from "@/components/footer/FooterPaymentBar";
import { FooterBottomBar } from "@/components/footer/FooterBottomBar";
import { staggerContainer } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface PremiumFooterProps {
  content: SiteContent;
}

export function PremiumFooter({ content }: PremiumFooterProps) {
  const { footer } = content;
  const paddingY = footer.spacing.sectionPaddingY;

  return (
    <footer
      className="relative overflow-hidden"
      aria-label="Site footer"
      style={
        {
          "--footer-gold": footer.colors.gold,
          "--footer-text": footer.colors.text,
        } as CSSProperties
      }
    >
      {/* Top cream section */}
      <div
        className="relative border-t border-luxury-gold/10"
        style={{
          background: `linear-gradient(180deg, ${footer.colors.topBackground} 0%, #FDFBF7 40%, ${footer.colors.topBackground} 100%)`,
        }}
      >
        {/* Subtle texture & light */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(216,180,106,0.08)_0%,transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.25] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMyNDQ3MzYiIG9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 opacity-[0.04] bg-[radial-gradient(circle,rgba(36,71,54,0.4)_0%,transparent_70%)]" />

        <div
          className="relative mx-auto max-w-7xl px-6 lg:px-8"
          style={{ paddingTop: paddingY, paddingBottom: paddingY * 0.6 }}
        >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-8"
          >
            <FooterBrand footer={footer} />
            <FooterQuickLinks links={footer.quickLinks} />
            <FooterContact contact={footer.contact} />
            <FooterNewsletter newsletter={footer.newsletter} social={footer.social} />
            <FooterGalleryPreview images={footer.galleryPreview} />
          </motion.div>

          {footer.showPayments && (
            <div className="mt-14 md:mt-16">
              <FooterPaymentBar label={footer.paymentLabel} enabledPayments={footer.enabledPayments} />
            </div>
          )}
        </div>
      </div>

      <FooterBottomBar footer={footer} />
    </footer>
  );
}
