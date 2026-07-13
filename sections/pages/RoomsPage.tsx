"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Users, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { roomDetailPath } from "@/lib/navigation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface RoomsPageProps {
  rooms: SiteContent["rooms"];
}

export function RoomsPage({ rooms }: RoomsPageProps) {
  return (
    <section className="section-padding bg-luxury-cream-light">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-12 lg:grid-cols-2"
        >
          {rooms.map((room, i) => (
            <motion.article
              key={room.id}
              id={room.id}
              variants={fadeUp}
              className="group luxury-card overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <MediaPlaceholder
                  src={room.imageSrc}
                  alt={room.name}
                  variant="room"
                  aspect="landscape"
                  className="min-h-[280px] transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute left-4 top-4 flex items-center gap-2 border border-white/25 bg-luxury-green-dark/70 px-3 py-1.5 text-xs text-white backdrop-blur-md">
                  <Users className="h-3.5 w-3.5 text-luxury-orange" />
                  {room.guests}
                </div>
              </div>

              <div className="p-8 lg:p-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-light text-luxury-green-dark">
                      {room.name}
                    </h2>
                    <p className="mt-2 text-sm text-luxury-muted">
                      From{" "}
                      <span className="font-medium text-luxury-orange">${room.price}</span>
                      /night
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-luxury-muted">
                    <Maximize2 className="h-3.5 w-3.5 text-luxury-orange" />
                    {room.size}
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-luxury-muted">
                  {room.description}
                </p>

                <div className="mt-6">
                  <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-luxury-orange">
                    Amenities
                  </p>
                  <ul className="grid grid-cols-2 gap-2">
                    {[room.bedType, ...room.features].slice(0, 6).map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-luxury-muted">
                        <Check className="h-3 w-3 shrink-0 text-luxury-orange" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button variant="gold" size="lg" className="w-full gap-2 uppercase tracking-[0.14em] sm:w-auto" asChild>
                    <Link href={roomDetailPath(room.id)} prefetch>
                      Explore Room
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full gap-2 uppercase tracking-[0.14em] sm:w-auto" asChild>
                    <Link href={roomDetailPath(room.id)} prefetch>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
