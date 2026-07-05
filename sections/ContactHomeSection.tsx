"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MotionSection } from "@/components/shared/MotionSection";
import { fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface ContactHomeSectionProps {
  contact: SiteContent["contact"];
  hotel: SiteContent["hotel"];
}

export function ContactHomeSection({ contact, hotel }: ContactHomeSectionProps) {
  return (
    <MotionSection
      id="contact"
      className="section-padding relative overflow-hidden bg-white"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <motion.p
            variants={fadeUp}
            className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-luxury-gold"
          >
            {contact.eyebrow}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-display text-3xl font-normal text-luxury-charcoal md:text-4xl lg:text-5xl"
          >
            {contact.title}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-xl text-luxury-muted"
          >
            {contact.description}
          </motion.p>
        </div>

        <div className="grid gap-16 lg:grid-cols-2">
          <motion.div variants={fadeUp}>
            <ul className="space-y-6">
              {[
                { icon: MapPin, label: "Address", value: hotel.address },
                { icon: Phone, label: "Telephone", value: hotel.phone },
                { icon: Mail, label: "Email", value: hotel.email },
                { icon: Clock, label: "Front Desk", value: contact.frontDesk },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-luxury-gold/15 bg-luxury-cream">
                    <item.icon className="h-4 w-4 text-luxury-gold" strokeWidth={1.2} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-luxury-gold">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm text-luxury-muted">{item.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.form
            variants={fadeUp}
            onSubmit={(e) => e.preventDefault()}
            className="border border-luxury-gold/10 bg-luxury-cream/40 p-8 md:p-10"
          >
            <h3 className="font-display text-xl text-luxury-charcoal">Send a Message</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input placeholder="Your Name" aria-label="Name" />
              <Input type="email" placeholder="Email Address" aria-label="Email" />
            </div>
            <Input className="mt-4" placeholder="Subject" aria-label="Subject" />
            <textarea
              placeholder="Your Message"
              rows={4}
              aria-label="Message"
              className="mt-4 w-full resize-none border border-luxury-gold/15 bg-white px-4 py-3 text-sm outline-none focus:border-luxury-gold/40"
            />
            <Button type="submit" variant="gold" className="mt-6 uppercase tracking-wider">
              Send Message
            </Button>
          </motion.form>
        </div>
      </div>
    </MotionSection>
  );
}
