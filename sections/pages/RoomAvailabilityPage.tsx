"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp, luxuryStagger } from "@/lib/animations";
import {
  buildBookUrl,
  buildRoomDetailUrl,
  calculateNights,
  formatBookingDate,
  isRoomAvailableForSearch,
} from "@/lib/booking/utils";
import type { BookingSearchParams } from "@/lib/booking/types";
import type { SiteContent } from "@/lib/cms/types";

interface RoomAvailabilityPageProps {
  rooms: SiteContent["rooms"];
  search: BookingSearchParams;
}

export function RoomAvailabilityPage({ rooms, search }: RoomAvailabilityPageProps) {
  const nights = calculateNights(search.checkIn, search.checkOut);
  const available = rooms.filter((room) => isRoomAvailableForSearch(room, search));

  return (
    <section className="section-padding bg-gradient-to-b from-luxury-cream-light via-luxury-sage/15 to-luxury-cream">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-luxury-gold">Reservations</p>
          <h1 className="mt-3 font-display text-4xl text-luxury-forest md:text-5xl">Available Rooms</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-luxury-muted md:text-base">
            {formatBookingDate(search.checkIn)} — {formatBookingDate(search.checkOut)} · {nights}{" "}
            {nights === 1 ? "night" : "nights"} · {search.guests} guests · {search.rooms}{" "}
            {Number(search.rooms) === 1 ? "room" : "rooms"}
          </p>
        </motion.div>

        {available.length === 0 ? (
          <div className="rounded-[28px] border border-luxury-gold/20 bg-white/60 p-12 text-center backdrop-blur-md">
            <p className="font-display text-2xl text-luxury-forest">No rooms match your search</p>
            <p className="mt-3 text-sm text-luxury-muted">Try adjusting guests, dates, or room quantity.</p>
            <Button asChild variant="gold" className="mt-8">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        ) : (
          <motion.div
            variants={luxuryStagger}
            initial="hidden"
            animate="visible"
            className="grid gap-8 md:grid-cols-2"
          >
            {available.map((room) => {
              const total = room.price * nights * Number(search.rooms || 1);
              return (
                <motion.article
                  key={room.id}
                  variants={fadeUp}
                  className="group overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-white/90 to-luxury-sage/30 shadow-luxury-lg transition duration-700 hover:-translate-y-1 hover:shadow-luxury-gold"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={room.imageSrc}
                      alt={room.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-green-dark/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-luxury-gold">From</p>
                        <p className="font-display text-3xl text-white">
                          ${room.price}
                          <span className="text-sm font-normal text-white/75"> / night</span>
                        </p>
                      </div>
                      <span className="rounded-full border border-luxury-gold/40 bg-luxury-green-dark/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-luxury-gold">
                        Available
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5 p-6 md:p-8">
                    <div>
                      <h2 className="font-display text-2xl text-luxury-forest">{room.name}</h2>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-luxury-muted">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-luxury-gold" />
                          {room.guests}
                        </span>
                        <span>{room.size}</span>
                        <span>{room.bedType}</span>
                      </div>
                    </div>

                    <p className="line-clamp-3 text-sm leading-relaxed text-luxury-muted">{room.description}</p>

                    <ul className="grid gap-2 sm:grid-cols-2">
                      {room.features.slice(0, 4).map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-xs text-luxury-muted">
                          <Check className="h-3.5 w-3.5 shrink-0 text-luxury-gold" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col gap-3 border-t border-luxury-gold/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-luxury-gold">Total from</p>
                        <p className="font-display text-2xl text-luxury-forest">${total}</p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button asChild variant="outline" className="border-luxury-gold/30 text-luxury-forest">
                          <Link href={buildRoomDetailUrl(room.id, search)}>View Details</Link>
                        </Button>
                        <Button asChild variant="gold" className="gap-2">
                          <Link href={buildBookUrl(room.id, search)}>
                            Select Room
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
