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
import { FOOTER } from "@/components/footer/footer-theme";
import { staggerContainer } from "@/lib/animations";
import { defaultContent } from "@/lib/cms/default-content";
import type { SiteContent } from "@/lib/cms/types";

interface PremiumFooterProps {
  content: SiteContent;
}

function stripSpaBrand(value: string) {
  return value
    .replace(/\s*&\s*SPA/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function PremiumFooter({ content }: PremiumFooterProps) {
  const { footer, header } = content;
  const paddingY = Math.max(footer.spacing.sectionPaddingY, 96);
  // Orbit/header logo only — never invent demo media when Orbit is empty.
  const logoSrc = (footer.logoSrc || header.logoSrc || "").trim();
  const legacyCream = /f8f5ee|faf6ee|fdfbf7|fff9f2/i.test(footer.colors.topBackground || "");
  const legacyTooDark = /^#0[Ff]2[Aa]22$/i.test(footer.colors.topBackground || "");
  const topBg = legacyCream || legacyTooDark
    ? FOOTER.topBg
    : footer.colors.topBackground || FOOTER.topBg;
  const bottomBg =
    legacyCream || /^#0[Aa]1[Ff]19$/i.test(footer.colors.bottomBackground || "")
      ? FOOTER.bottomBg
      : footer.colors.bottomBackground || FOOTER.bottomBg;
  const description = /haven of warmth|&\s*Spa|refined comfort, elevated/i.test(
    footer.description || ""
  )
    ? defaultContent.footer.description
    : footer.description;
  const brandName = stripSpaBrand(footer.brandName || defaultContent.footer.brandName);
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
      gold: FOOTER.gold,
      text: FOOTER.body,
    },
  };

  return (
    <footer
      className="relative overflow-hidden"
      aria-label="Site footer"
      style={
        {
          "--footer-gold": FOOTER.gold,
          "--footer-text": FOOTER.body,
        } as CSSProperties
      }
    >
      <div
        className="relative border-t"
        style={{ backgroundColor: topBg, borderColor: `${FOOTER.gold}40` }}
      >
        <FooterAtmosphere showMountains={footer.showMountains !== false} />

        <div
          className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12"
          style={{
            paddingTop: paddingY,
            paddingBottom: Math.round(paddingY * 0.9),
          }}
        >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-x-16 md:gap-y-16 lg:grid-cols-5 lg:gap-x-14 lg:gap-y-0"
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
