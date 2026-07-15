"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { FooterAccordion } from "@/components/footer/FooterAccordion";
import { FOOTER } from "@/components/footer/footer-theme";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/lib/cms/types";

interface FooterNewsletterProps {
  newsletter: SiteContent["footer"]["newsletter"];
  social: SiteContent["footer"]["social"];
}

export function FooterNewsletter({ newsletter, social }: FooterNewsletterProps) {
  const [email, setEmail] = useState("");

  const socialLinks = [
    { href: social.facebook, icon: Facebook, label: "Facebook" },
    { href: social.instagram, icon: Instagram, label: "Instagram" },
    { href: social.youtube, icon: Youtube, label: "YouTube" },
    { href: social.twitter, icon: FaXTwitter, label: "X", reactIcon: true as const },
    { href: social.linkedin, icon: Linkedin, label: "LinkedIn" },
  ].filter((s) => Boolean(s.href));

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
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  "transition-all duration-500 ease-[0.22,1,0.36,1]",
                  "hover:-translate-y-0.5"
                )}
                style={{
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: `${FOOTER.gold}70`,
                  color: FOOTER.body,
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = FOOTER.gold;
                  e.currentTarget.style.color = "#0A1F19";
                  e.currentTarget.style.borderColor = FOOTER.gold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = FOOTER.body;
                  e.currentTarget.style.borderColor = `${FOOTER.gold}70`;
                }}
              >
                {"reactIcon" in s ? (
                  <s.icon className="h-3.5 w-3.5" />
                ) : (
                  <s.icon className="h-3.5 w-3.5" strokeWidth={1.2} />
                )}
              </a>
            ))}
          </div>
        ) : null}
      </FooterAccordion>
    </motion.div>
  );
}
