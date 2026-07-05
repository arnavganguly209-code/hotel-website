"use client";

import { motion } from "framer-motion";

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalContentProps {
  title: string;
  sections: LegalSection[];
}

export function LegalContent({ title, sections }: LegalContentProps) {
  return (
    <section className="px-6 py-28 lg:px-8 lg:py-36">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-luxury-gold">Legal</p>
          <h1 className="mt-4 font-display text-4xl font-light text-luxury-charcoal md:text-5xl">
            {title}
          </h1>
          <div className="mt-8 h-px w-16 bg-luxury-gold/40" />
          <div className="mt-12 space-y-10">
            {sections.map((section, i) => (
              <motion.div
                key={section.heading}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <h2 className="font-display text-xl text-luxury-charcoal">
                  {section.heading}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-luxury-muted">
                  {section.body}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
