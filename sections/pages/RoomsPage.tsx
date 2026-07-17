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

function uniqueAmenities(bedType: string | undefined, features: string[] | undefined) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [bedType, ...(features || [])]) {
    const item = typeof raw === "string" ? raw.trim() : "";
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out.slice(0, 6);
}

export function RoomsPage({ rooms }: RoomsPageProps) {
  return (
    <section className="section-padding bg-luxury-cream-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12"
        >
          {rooms.map((room) => {
            const amenities = uniqueAmenities(room.bedType, room.features);
            return (
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
                    className="min-h-[240px] sm:min-h-[280px] transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute left-4 top-4 flex min-h-10 items-center gap-2 border border-white/25 bg-luxury-green-dark/70 px-3 py-1.5 text-xs text-white backdrop-blur-md">
                    <Users className="h-3.5 w-3.5 text-luxury-orange" />
                    {room.guests}
                  </div>
                </div>

                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-display text-xl font-light text-luxury-green-dark sm:text-2xl">
                        {room.name}
                      </h2>
                      <p className="mt-2 text-sm text-luxury-muted">
                        From{" "}
                        <span className="font-medium text-luxury-orange">${room.price}</span>
                        /night
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-xs text-luxury-muted">
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
                    <ul
                      className="grid grid-cols-2 gap-2"
                      data-amenities-version="v2"
                    >
                      {amenities.map((item, index) => (
                        <li
                          key={`${room.id}-amenity-${index}-${item}`}
                          className="flex items-center gap-2 text-xs text-luxury-muted"
                        >
                          <Check className="h-3 w-3 shrink-0 text-luxury-orange" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button
                      variant="gold"
                      size="lg"
                      className="w-full gap-2 uppercase tracking-[0.14em] sm:w-auto"
                      asChild
                    >
                      <Link href={roomDetailPath(room.id)} prefetch>
                        Explore Room
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full gap-2 uppercase tracking-[0.14em] sm:w-auto"
                      asChild
                    >
                      <Link href={roomDetailPath(room.id)} prefetch>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
