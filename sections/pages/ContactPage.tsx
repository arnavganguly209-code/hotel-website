"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingWidget } from "@/components/shared/BookingWidget";
import type { SiteContent } from "@/lib/cms/types";

interface ContactPageProps {
  content: SiteContent;
}

export function ContactPage({ content }: ContactPageProps) {
  const { hotel, contact } = content;

  return (
    <section className="section-padding bg-luxury-cream-light">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16">
          <BookingWidget variant="inline" rooms={content.rooms} />
        </div>

        <div className="grid gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-luxury-orange">{contact.eyebrow}</p>
            <h2 className="mt-4 font-display text-3xl font-light text-luxury-green-dark">
              {contact.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-luxury-muted">{contact.description}</p>

            <ul className="mt-10 space-y-6">
              {[
                { icon: MapPin, label: "Address", value: hotel.address },
                { icon: Phone, label: "Telephone", value: hotel.phone, href: `tel:${hotel.phone}` },
                { icon: Mail, label: "Email", value: hotel.email, href: `mailto:${hotel.email}` },
                { icon: Clock, label: "Working Hours", value: contact.workingHours },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-luxury-orange/15 bg-luxury-orange/5">
                    <item.icon className="h-4 w-4 text-luxury-orange" strokeWidth={1.2} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-luxury-orange">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="mt-1 block text-sm text-luxury-muted hover:text-luxury-orange">
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-luxury-muted">{item.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex items-center gap-4">
              {[
                { href: hotel.social.facebook, label: "Facebook" },
                { href: hotel.social.instagram, label: "Instagram" },
                { href: hotel.social.twitter, label: "Twitter" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-wider text-luxury-muted transition-colors hover:text-luxury-orange"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={(e) => e.preventDefault()}
            className="luxury-card p-8 md:p-10"
          >
            <h3 className="font-display text-xl text-luxury-green-dark">Send an Inquiry</h3>
            <div className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fname" className="mb-2 block text-xs uppercase tracking-wider text-luxury-muted">
                    First Name
                  </label>
                  <input id="fname" required className="w-full border border-luxury-orange/15 bg-white px-4 py-3 text-sm focus:border-luxury-orange/40 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="lname" className="mb-2 block text-xs uppercase tracking-wider text-luxury-muted">
                    Last Name
                  </label>
                  <input id="lname" required className="w-full border border-luxury-orange/15 bg-white px-4 py-3 text-sm focus:border-luxury-orange/40 focus:outline-none" />
                </div>
              </div>
              <div>
                <label htmlFor="cemail" className="mb-2 block text-xs uppercase tracking-wider text-luxury-muted">
                  Email
                </label>
                <input id="cemail" type="email" required className="w-full border border-luxury-orange/15 bg-white px-4 py-3 text-sm focus:border-luxury-orange/40 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="cmessage" className="mb-2 block text-xs uppercase tracking-wider text-luxury-muted">
                  Message
                </label>
                <textarea id="cmessage" rows={5} required className="w-full resize-none border border-luxury-orange/15 bg-white px-4 py-3 text-sm focus:border-luxury-orange/40 focus:outline-none" />
              </div>
              <Button type="submit" variant="gold" size="lg" className="w-full">
                Send Message
              </Button>
            </div>
          </motion.form>
        </div>

        {contact.mapEmbedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 overflow-hidden border border-luxury-orange/10 shadow-luxury"
          >
            <iframe
              src={contact.mapEmbedUrl}
              title="Hotel location map"
              className="h-[400px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
