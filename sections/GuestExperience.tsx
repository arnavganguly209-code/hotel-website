"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TESTIMONIALS } from "@/lib/data";

export function GuestExperience() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const testimonial = TESTIMONIALS[current];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden px-6 py-28 lg:px-8 lg:py-36"
    >
      <div className="absolute inset-0 bg-luxury-cream" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(198,169,114,0.06)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="Guest Experience"
          title="Voices of Distinction"
          description="Stories from guests who have experienced the art of luxury hospitality."
        />

        <div className="relative">
          <div className="overflow-hidden rounded-sm border border-luxury-gold/10 bg-white/70 p-10 shadow-luxury-lg backdrop-blur-xl md:p-14">
            <Quote className="mb-6 h-8 w-8 text-luxury-gold/40" strokeWidth={1} />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-6 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-luxury-gold text-luxury-gold"
                    />
                  ))}
                </div>

                <blockquote className="font-display text-xl font-light leading-relaxed text-luxury-charcoal md:text-2xl">
                  &ldquo;{testimonial.review}&rdquo;
                </blockquote>

                <div className="mt-8 flex items-center gap-4 border-t border-luxury-gold/10 pt-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-luxury-gold/20 bg-luxury-gold/5 font-display text-lg text-luxury-gold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-luxury-charcoal">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-luxury-muted">{testimonial.country}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-luxury-gold/20 text-luxury-muted transition-all hover:border-luxury-gold/40 hover:text-luxury-gold"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-8 bg-luxury-gold"
                      : "w-1.5 bg-luxury-gold/20 hover:bg-luxury-gold/40"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-luxury-gold/20 text-luxury-muted transition-all hover:border-luxury-gold/40 hover:text-luxury-gold"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
