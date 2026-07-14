"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/shared/SectionHeading";

const GALLERY_ITEMS = [
  {
    title: "Architectural Elegance",
    category: "Design",
    description: "Refined interiors crafted with meticulous attention to detail.",
  },
  {
    title: "Garden Sanctuary",
    category: "Ambience",
    description: "A tranquil oasis amidst the energy of Thamel.",
  },
  {
    title: "Culinary Artistry",
    category: "Dining",
    description: "Where Korean tradition meets contemporary fine dining.",
  },
  {
    title: "Rooftop Serenity",
    category: "Skyz Lounge",
    description: "Elevated evenings above the Kathmandu skyline.",
  },
  {
    title: "Wellness Haven",
    category: "Spa",
    description: "A sanctuary dedicated to restoration and renewal.",
  },
  {
    title: "Luxury Comfort",
    category: "Rooms",
    description: "Spaces designed for rest, reflection, and refinement.",
  },
] as const;

export function Gallery() {
  return (
    <section id="gallery" className="relative px-6 py-28 lg:px-8 lg:py-36">
      <div className="absolute inset-0 bg-luxury-cream" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Experience"
          title="The Art of Luxury"
          description="A visual journey through the essence of Hotel Thamel Park — expressed through design, not imagery."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-sm border border-luxury-gold/10"
            >
              <div
                className={`relative flex h-64 flex-col justify-end bg-gradient-to-br p-8 transition-all duration-700 group-hover:scale-[1.02] ${
                  i % 3 === 0
                    ? "from-luxury-cream via-white to-luxury-gold/10"
                    : i % 3 === 1
                      ? "from-white via-luxury-sand to-luxury-cream"
                      : "from-luxury-gold/5 via-luxury-cream to-white"
                }`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(198,169,114,0.08)_0%,transparent_60%)] transition-opacity duration-500 group-hover:opacity-150" />

                <span className="relative mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-luxury-gold">
                  {item.category}
                </span>
                <h3 className="relative font-display text-2xl font-light text-luxury-charcoal">
                  {item.title}
                </h3>
                <p className="relative mt-2 text-sm text-luxury-muted opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {item.description}
                </p>

                <div className="absolute right-6 top-6 font-display text-6xl font-light text-luxury-gold/10 transition-colors duration-500 group-hover:text-luxury-gold/20">
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
