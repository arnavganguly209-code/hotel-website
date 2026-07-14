"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { FooterAtmosphere } from "@/components/footer/FooterAtmosphere";
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
  const paddingY = Math.max(footer.spacing.sectionPaddingY, 88);
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
      <div className="relative border-t border-luxury-gold/20">
        <FooterAtmosphere />

        <div
          className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10"
          style={{
            paddingTop: paddingY,
            paddingBottom: Math.round(paddingY * 0.85),
          }}
        >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-x-12 md:gap-y-14 lg:grid-cols-5 lg:gap-x-9 lg:gap-y-0"
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
