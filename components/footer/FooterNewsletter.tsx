"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Facebook, Instagram } from "lucide-react";
import { FaTripadvisor, FaGoogle } from "react-icons/fa";
import { FooterAccordion } from "@/components/footer/FooterAccordion";
import { FOOTER } from "@/components/footer/footer-theme";
import { hasMediaSrc, mediaUrl } from "@/lib/cms/media-url";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/lib/cms/types";

interface FooterNewsletterProps {
  newsletter: SiteContent["footer"]["newsletter"];
  social: SiteContent["footer"]["social"];
}

type SocialItem = {
  key: string;
  label: string;
  href: string;
  iconSrc: string;
  fallback: ReactNode;
};

export function FooterNewsletter({ newsletter, social }: FooterNewsletterProps) {
  const [email, setEmail] = useState("");

  const socialLinks: SocialItem[] = [
    {
      key: "facebook",
      label: "Facebook",
      href: social.facebook,
      iconSrc: social.facebookIcon,
      fallback: <Facebook className="h-4 w-4" strokeWidth={1.25} />,
    },
    {
      key: "instagram",
      label: "Instagram",
      href: social.instagram,
      iconSrc: social.instagramIcon,
      fallback: <Instagram className="h-4 w-4" strokeWidth={1.25} />,
    },
    {
      key: "tripadvisor",
      label: "Tripadvisor",
      href: social.tripadvisor,
      iconSrc: social.tripadvisorIcon,
      fallback: <FaTripadvisor className="h-4 w-4" />,
    },
    {
      key: "googleReviews",
      label: "Google Reviews",
      href: social.googleReviews,
      iconSrc: social.googleReviewsIcon,
      fallback: <FaGoogle className="h-3.5 w-3.5" />,
    },
  ].filter((s) => Boolean(s.href?.trim()));

  return (
    <motion.div variants={fadeUp} className="w-full">
      <FooterAccordion title="Stay Connected">
        <p
          className="mb-5 font-body text-[14px] font-medium leading-[1.85] tracking-[0.02em]"
          style={{ color: FOOTER.body }}
        >
          {newsletter.description}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setEmail("");
          }}
          className="mb-7 space-y-3"
        >
          <label htmlFor="footer-newsletter-email" className="sr-only">
            Email for newsletter
          </label>
          <input
            id="footer-newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={newsletter.placeholder}
            required
            className={cn(
              "w-full rounded-md border px-4 py-3.5",
              "font-body text-[13px] font-medium tracking-[0.02em] outline-none",
              "transition-all duration-400"
            )}
            style={{
              borderColor: `${FOOTER.gold}55`,
              backgroundColor: FOOTER.cream,
              color: FOOTER.topBg,
            }}
          />
          <button
            type="submit"
            className={cn(
              "w-full rounded-md px-5 py-3.5",
              "font-display text-[11px] font-bold uppercase tracking-[0.28em]",
              "shadow-[0_6px_18px_rgba(0,0,0,0.25)]",
              "transition-all duration-500"
            )}
            style={{
              backgroundColor: FOOTER.button,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: `${FOOTER.gold}55`,
              color: FOOTER.body,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = FOOTER.gold;
              e.currentTarget.style.color = "#0A1F19";
              e.currentTarget.style.borderColor = FOOTER.gold;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = FOOTER.button;
              e.currentTarget.style.color = FOOTER.body;
              e.currentTarget.style.borderColor = `${FOOTER.gold}55`;
            }}
          >
            {newsletter.buttonText}
          </button>
        </form>

        {socialLinks.length > 0 ? (
          <div
            className={cn(
              "grid grid-cols-2 gap-3 sm:flex sm:flex-nowrap sm:items-center",
              "justify-items-center sm:justify-start"
            )}
          >
            {socialLinks.map((s) => {
              const customIcon = hasMediaSrc(s.iconSrc)
                ? mediaUrl(s.iconSrc, s.iconSrc)
                : "";
              return (
                <a
                  key={`${s.key}-${customIcon || "default"}`}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    "transition-all duration-500 ease-[0.22,1,0.36,1]",
                    "hover:-translate-y-0.5"
                  )}
                  style={{
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: `${FOOTER.gold}70`,
                    color: FOOTER.gold,
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = FOOTER.gold;
                    e.currentTarget.style.color = "#0A1F19";
                    e.currentTarget.style.borderColor = FOOTER.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = FOOTER.gold;
                    e.currentTarget.style.borderColor = `${FOOTER.gold}70`;
                  }}
                >
                  {customIcon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={customIcon}
                      alt=""
                      className="block"
                      style={{
                        maxWidth: "60%",
                        maxHeight: "60%",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                        objectPosition: "center",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    s.fallback
                  )}
                </a>
              );
            })}
          </div>
        ) : null}
      </FooterAccordion>
    </motion.div>
  );
}
