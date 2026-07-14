"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { FooterBrand } from "@/components/footer/FooterBrand";
import { FooterQuickLinks } from "@/components/footer/FooterQuickLinks";
import { FooterGuestServices } from "@/components/footer/FooterGuestServices";
import { FooterNewsletter } from "@/components/footer/FooterNewsletter";
import { FooterSecurePayments } from "@/components/footer/FooterSecurePayments";
import { FooterBottomBar } from "@/components/footer/FooterBottomBar";
import { staggerContainer } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface PremiumFooterProps {
  content: SiteContent;
}

export function PremiumFooter({ content }: PremiumFooterProps) {
  const { footer, header } = content;
  const paddingY = footer.spacing.sectionPaddingY;
  const logoSrc = footer.logoSrc || header.logoSrc || "";

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
      <div
        className="relative border-t border-luxury-gold/12"
        style={{
          background: `linear-gradient(180deg, ${footer.colors.topBackground} 0%, #FDFBF7 45%, ${footer.colors.topBackground} 100%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(201,154,74,0.06)_0%,transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.2] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMyNDQ3MzYiIG9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')]" />

        <div
          className="relative mx-auto max-w-7xl px-6 lg:px-10"
          style={{ paddingTop: paddingY, paddingBottom: Math.round(paddingY * 0.75) }}
        >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-5 lg:gap-x-8 lg:gap-y-0"
          >
            <FooterBrand
              logoSrc={logoSrc}
              brandName={footer.brandName}
              description={footer.description}
            />
            <FooterQuickLinks links={footer.quickLinks} />
            <FooterGuestServices contact={footer.contact} />
            <FooterNewsletter newsletter={footer.newsletter} social={footer.social} />
            {footer.showPayments ? (
              <FooterSecurePayments
                label={footer.paymentLabel}
                enabledPayments={footer.enabledPayments}
              />
            ) : null}
          </motion.div>
        </div>
      </div>

      <FooterBottomBar footer={footer} />
    </footer>
  );
}
