"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/navigation";

import type { HomeSectionMeta } from "@/lib/cms/types";

interface FinalCTAProps {
  meta?: HomeSectionMeta;
}

export function FinalCTA({ meta }: FinalCTAProps) {
  const eyebrow = "PERSONALIZED RESERVATIONS";
  const title = "Every Exceptional Stay Starts With a Conversation";
  const description =
    "Connect with our hospitality specialists to plan a stay tailored entirely to your preferences.";
  const ctaText = "Contact Concierge";
  const ctaHref = meta?.ctaHref || routes.contact;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-luxury-green via-luxury-green-dark to-luxury-green py-12 md:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(216,180,106,0.15)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-medium uppercase tracking-[0.35em] text-luxury-champagne"
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-6 font-display text-3xl font-medium text-white sm:text-4xl md:text-5xl"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-base text-white/70"
        >
          {description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <Button variant="gold" size="lg" className="rounded-xl" asChild>
            <Link href={ctaHref}>
              {ctaText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
