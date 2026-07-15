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
import { defaultContent } from "@/lib/cms/default-content";
import type { SiteContent } from "@/lib/cms/types";

interface PremiumFooterProps {
  content: SiteContent;
}

export function PremiumFooter({ content }: PremiumFooterProps) {
  const { footer, header } = content;
  const paddingY = Math.max(footer.spacing.sectionPaddingY, 88);
  const logoSrc = footer.logoSrc || header.logoSrc || "/media/logo/hotel-logo.png";
  // Migrate legacy cream footers to the dark emerald luxury theme
  const legacyCream = /f8f5ee|faf6ee|fdfbf7|fff9f2/i.test(footer.colors.topBackground || "");
  const topBg = legacyCream ? "#0F2A22" : footer.colors.topBackground || "#0F2A22";
  const bottomBg = legacyCream ? "#0A1F19" : footer.colors.bottomBackground || "#0A1F19";
  const description = /haven of warmth|&\s*Spa|refined comfort, elevated/i.test(footer.description || "")
    ? defaultContent.footer.description
    : footer.description;
  const brandName = (footer.brandName || defaultContent.footer.brandName)
    .replace(/\s*&\s*SPA/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const copyrightText = /&\s*Spa/i.test(footer.copyrightText || "")
    ? defaultContent.footer.copyrightText
    : footer.copyrightText;
  const footerForBar = {
    ...footer,
    brandName,
    description,
    copyrightText,
    colors: {
      ...footer.colors,
      topBackground: topBg,
      bottomBackground: bottomBg,
      gold: footer.colors.gold || "#C8A145",
      text: legacyCream ? "#F3EBD8" : footer.colors.text || "#F3EBD8",
    },
  };

  return (
    <footer
      className="relative overflow-hidden"
      aria-label="Site footer"
      style={
        {
          "--footer-gold": footerForBar.colors.gold,
          "--footer-text": footerForBar.colors.text,
        } as CSSProperties
      }
    >
      <div
        className="relative border-t border-[#C8A145]/25"
        style={{ backgroundColor: topBg }}
      >
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
              brandName={brandName || "HOTEL THAMEL PARK"}
              description={description}
            />
            <FooterQuickLinks links={footer.quickLinks} />
            <FooterGuestServices contact={footer.contact} />
            <FooterNewsletter newsletter={footer.newsletter} social={footer.social} />
            {footer.showPayments !== false ? (
              <FooterSecurePayments
                label={footer.paymentLabel || "Secure Payments"}
                paymentLogos={footer.paymentLogos || defaultContent.footer.paymentLogos}
              />
            ) : null}
          </motion.div>
        </div>
      </div>

      <FooterBottomBar footer={footerForBar} />
    </footer>
  );
}
