"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/data";

export function FAQ() {
  return (
    <section id="faq" className="relative px-6 py-28 lg:px-8 lg:py-36">
      <div className="absolute inset-0 bg-luxury-cream" />

      <div className="relative mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Information"
          title="Frequently Asked Questions"
          description="Everything you need to know for a seamless luxury experience."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-sm border border-luxury-gold/10 bg-white/70 px-8 shadow-luxury backdrop-blur-xl md:px-12"
        >
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
