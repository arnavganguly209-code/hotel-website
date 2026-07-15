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
        <p className="mb-5 font-body text-[13px] font-normal leading-[1.85] tracking-[0.02em] text-[#F3EBD8]/78">
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
              "w-full rounded-md border border-[#C8A145]/35 bg-[#FAF6EE] px-4 py-3.5",
              "font-body text-[13px] font-normal tracking-[0.02em] text-[#0F2A22]",
              "placeholder:text-[#5A6B60]/55 outline-none",
              "transition-all duration-400 focus:border-[#C8A145]/70 focus:shadow-[0_0_0_3px_rgba(200,161,69,0.12)]"
            )}
          />
          <button
            type="submit"
            className={cn(
              "w-full rounded-md bg-[#0F2A22] px-5 py-3.5",
              "border border-[#C8A145]/35",
              "font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F3EBD8]",
              "shadow-[0_6px_18px_rgba(0,0,0,0.25)]",
              "transition-all duration-500",
              "hover:border-[#C8A145] hover:bg-[#C8A145] hover:text-[#0A1F19]"
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
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  "border border-[#C8A145]/45 bg-transparent text-[#F3EBD8]/75",
                  "transition-all duration-500 ease-[0.22,1,0.36,1]",
                  "hover:-translate-y-0.5 hover:border-[#C8A145] hover:bg-[#C8A145] hover:text-[#0A1F19]",
                  "hover:shadow-[0_6px_16px_rgba(200,161,69,0.28)]"
                )}
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
