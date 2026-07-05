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
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-luxury-green via-luxury-green-dark to-luxury-green py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(216,180,106,0.15)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-medium uppercase tracking-[0.35em] text-luxury-champagne"
        >
          {meta?.eyebrow ?? "Reservations"}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-6 font-display text-4xl font-medium text-white md:text-5xl"
        >
          {meta?.title ?? "Begin Your Luxury Journey"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-base text-white/70"
        >
          {meta?.description ?? "Experience the finest hospitality in the heart of Thamel."}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <Button variant="gold" size="lg" className="rounded-xl" asChild>
            <Link href={meta?.ctaHref ?? routes.contact}>
              {meta?.ctaText ?? "Book Your Stay"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
