"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
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
    { href: social.twitter, icon: FaXTwitter, label: "X", reactIcon: true },
    { href: social.linkedin, icon: Linkedin, label: "LinkedIn" },
  ];

  return (
    <motion.div variants={fadeUp} className="w-full">
      <h3 className="mb-3 font-display text-xs font-medium uppercase tracking-[0.28em] text-luxury-gold">
        {newsletter.heading}
      </h3>
      <p className="mb-5 text-sm leading-relaxed text-luxury-muted/90">{newsletter.description}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setEmail("");
        }}
        className="relative mb-6"
      >
        <div className="flex overflow-hidden rounded-xl border border-luxury-gold/20 bg-white/60 shadow-luxury backdrop-blur-md">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={newsletter.placeholder}
            required
            aria-label="Email for newsletter"
            className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-luxury-green-dark outline-none placeholder:text-luxury-muted/50"
          />
          <button
            type="submit"
            className="flex items-center gap-1 bg-luxury-gold px-4 text-xs font-medium uppercase tracking-wider text-white transition-all hover:bg-luxury-gold-dark"
          >
            <span className="hidden sm:inline">{newsletter.buttonText}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2.5">
        {socialLinks.map((s) => (
          <motion.a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border border-luxury-gold/25",
              "bg-luxury-cream-light/80 text-luxury-muted transition-all",
              "hover:border-luxury-gold/50 hover:text-luxury-gold hover:shadow-glow"
            )}
          >
            {"reactIcon" in s ? (
              <s.icon className="h-4 w-4" />
            ) : (
              <s.icon className="h-4 w-4" strokeWidth={1.3} />
            )}
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
