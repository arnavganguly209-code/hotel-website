"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Heart, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { meetingsImages } from "@/lib/media";
import { routes } from "@/lib/navigation";
import { fadeUp, staggerContainer } from "@/lib/animations";

const events = [
  {
    title: "Grand Ballroom",
    description:
      "An elegant setting for corporate galas, conferences, and prestigious gatherings up to 200 guests.",
    icon: Briefcase,
    image: meetingsImages.ballroom,
    features: ["AV Equipment", "Catering Service", "Dedicated Coordinator"],
  },
  {
    title: "Wedding Celebrations",
    description:
      "Create unforgettable moments with bespoke wedding packages, from intimate ceremonies to grand receptions.",
    icon: Heart,
    image: meetingsImages.wedding,
    features: ["Custom Décor", "Bridal Suite", "Photography Locations"],
  },
  {
    title: "Executive Boardroom",
    description:
      "A refined space for executive meetings, presentations, and private business discussions.",
    icon: Users,
    image: meetingsImages.conference,
    features: ["High-Speed WiFi", "Presentation Tools", "Refreshment Service"],
  },
];

export function MeetingsPage() {
  return (
    <section className="px-6 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-24"
        >
          {events.map((event, i) => (
            <motion.article
              key={event.title}
              variants={fadeUp}
              className={`grid items-center gap-12 lg:grid-cols-2 ${
                i % 2 === 1 ? "" : ""
              }`}
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <MediaPlaceholder
                  src={event.image}
                  alt={event.title}
                  variant="event"
                  aspect="landscape"
                  className="min-h-[380px]"
                />
              </div>
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <event.icon className="h-6 w-6 text-luxury-gold" strokeWidth={1.2} />
                <h2 className="mt-4 font-display text-3xl font-light text-luxury-charcoal">
                  {event.title}
                </h2>
                <p className="mt-4 leading-relaxed text-luxury-muted">
                  {event.description}
                </p>
                <ul className="mt-6 space-y-2">
                  {event.features.map((f) => (
                    <li key={f} className="text-sm text-luxury-muted">
                      <span className="mr-2 text-luxury-gold">—</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 border border-luxury-gold/15 bg-luxury-cream/50 p-12 text-center md:p-16"
        >
          <h3 className="font-display text-3xl font-light text-luxury-charcoal">
            Plan Your Event
          </h3>
          <p className="mx-auto mt-4 max-w-lg text-sm text-luxury-muted">
            Our events team will craft a bespoke experience tailored to your vision.
          </p>
          <Button variant="gold" size="lg" className="mt-8" asChild>
            <Link href={routes.contact}>
              Inquire Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
