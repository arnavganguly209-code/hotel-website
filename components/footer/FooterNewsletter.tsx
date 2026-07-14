"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { FooterAccordion } from "@/components/footer/FooterAccordion";
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
        <p className="mb-5 text-[13px] leading-[1.8] tracking-wide text-luxury-muted/95">
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
              "w-full border border-luxury-gold/25 bg-luxury-cream-light/70 px-4 py-3.5",
              "text-[13px] tracking-wide text-luxury-green-dark outline-none",
              "placeholder:text-luxury-muted/45",
              "transition-colors duration-300 focus:border-luxury-gold/50"
            )}
          />
          <button
            type="submit"
            className={cn(
              "w-full border border-luxury-gold/40 bg-transparent px-5 py-3.5",
              "font-display text-[11px] font-medium uppercase tracking-[0.28em] text-luxury-gold",
              "transition-all duration-500",
              "hover:border-luxury-gold hover:bg-luxury-gold hover:text-white"
            )}
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
                  "flex h-9 w-9 items-center justify-center",
                  "border border-luxury-gold/20 text-luxury-muted",
                  "transition-all duration-400",
                  "hover:border-luxury-gold/45 hover:text-luxury-gold"
                )}
              >
                {"reactIcon" in s ? (
                  <s.icon className="h-3.5 w-3.5" />
                ) : (
                  <s.icon className="h-3.5 w-3.5" strokeWidth={1.25} />
                )}
              </a>
            ))}
          </div>
        ) : null}
      </FooterAccordion>
    </motion.div>
  );
}
