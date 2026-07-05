"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { MotionSection } from "@/components/shared/MotionSection";
import { staggerContainer, fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface ReviewsSectionProps {
  reviews: SiteContent["reviews"];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <MotionSection
      id="reviews"
      className="section-padding relative overflow-hidden bg-luxury-green-pale/30"
    >
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Guest Experiences"
          title="What Our Guests Say"
          description="Discover why discerning travelers from around the world choose Hotel Thamel Park & Spa."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3"
        >
          {reviews.map((review) => (
            <motion.blockquote
              key={review.id}
              variants={fadeUp}
              className="luxury-card flex flex-col p-8"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-luxury-gold text-luxury-gold"
                  />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-luxury-muted italic">
                &ldquo;{review.review}&rdquo;
              </p>
              <footer className="mt-6 border-t border-luxury-gold/10 pt-6">
                <p className="font-display text-lg text-luxury-charcoal">
                  {review.name}
                </p>
                <p className="text-xs uppercase tracking-wider text-luxury-muted">
                  {review.country}
                </p>
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </MotionSection>
  );
}
