"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Maximize2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuxuryRoomGallery } from "@/components/booking/LuxuryRoomGallery";
import { LuxuryBookingCheckout } from "@/components/booking/LuxuryBookingCheckout";
import { fadeUp, luxuryStagger } from "@/lib/animations";
import { buildBookUrl, calculateNights, formatBookingDate } from "@/lib/booking/utils";
import type { BookingSearchParams } from "@/lib/booking/types";
import type { SiteContent } from "@/lib/cms/types";

interface RoomDetailPageProps {
  room: SiteContent["rooms"][number];
  booking: SiteContent["roomBooking"];
  search?: BookingSearchParams;
  showCheckout?: boolean;
}

export function RoomDetailPage({ room, booking, search, showCheckout = false }: RoomDetailPageProps) {
  const gallery = room.gallery.length ? room.gallery : [room.imageSrc];
  const hasSearch = Boolean(search?.checkIn && search?.checkOut);
  const nights = search ? calculateNights(search.checkIn, search.checkOut) : 1;

  if (showCheckout && search) {
    return (
      <section className="section-padding bg-gradient-to-b from-luxury-cream-light to-luxury-sage/20">
        <LuxuryBookingCheckout room={room} booking={booking} search={search} />
      </section>
    );
  }

  return (
    <section className="section-padding bg-gradient-to-b from-luxury-cream-light via-white to-luxury-sage/25">
      <div className="mx-auto max-w-7xl space-y-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <LuxuryRoomGallery images={gallery} alt={room.name} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1 }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-luxury-gold">Accommodation</p>
            <h1 className="mt-3 font-display text-4xl text-luxury-forest md:text-5xl">{room.name}</h1>
            <div className="mt-4 flex flex-wrap gap-5 text-sm text-luxury-muted">
              <span className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4 text-luxury-gold" />
                {room.size}
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-luxury-gold" />
                {room.guests}
              </span>
              <span>{room.bedType}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${room.available !== false ? "bg-luxury-gold/15 text-luxury-gold" : "bg-red-100 text-red-600"}`}>
                {room.available !== false ? "Available" : "Unavailable"}
              </span>
            </div>
            <div className="my-6 h-px w-20 bg-gradient-to-r from-luxury-gold to-transparent" />
            <p className="text-base leading-[1.85] text-luxury-muted">{room.longDescription}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <p className="font-display text-3xl text-luxury-forest">
                ${room.price}
                <span className="text-sm font-normal text-luxury-muted"> / night</span>
              </p>
              {hasSearch && search ? (
                <Button asChild variant="gold" size="lg" className="gap-2 uppercase tracking-[0.14em]">
                  <Link href={buildBookUrl(room.id, search)}>
                    Reserve Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </div>

            {hasSearch && search ? (
              <p className="mt-4 text-sm text-luxury-muted">
                {formatBookingDate(search.checkIn)} — {formatBookingDate(search.checkOut)} · {nights}{" "}
                {nights === 1 ? "night" : "nights"}
              </p>
            ) : null}
          </motion.div>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          <motion.div
            variants={luxuryStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-10 lg:col-span-3"
          >
            <div>
              <h2 className="font-display text-2xl text-luxury-forest">Room Features</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {room.features.map((feature) => (
                  <motion.li key={feature} variants={fadeUp} className="flex items-center gap-3 text-sm text-luxury-muted">
                    <Check className="h-4 w-4 shrink-0 text-luxury-gold" />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-luxury-forest">Amenities & Facilities</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {room.amenities.map((item) => (
                  <motion.li key={item} variants={fadeUp} className="flex items-center gap-3 text-sm text-luxury-muted">
                    <Check className="h-4 w-4 shrink-0 text-luxury-gold" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-luxury-forest">Policies</h2>
              <ul className="mt-6 space-y-3">
                {room.policies.map((policy) => (
                  <motion.li key={policy} variants={fadeUp} className="text-sm leading-relaxed text-luxury-muted">
                    {policy}
                  </motion.li>
                ))}
              </ul>
            </div>

            {hasSearch && search ? (
              <div className="rounded-[28px] border border-luxury-gold/20 bg-gradient-to-r from-luxury-green-dark to-luxury-forest p-8 text-white md:flex md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-luxury-gold">Ready to book?</p>
                  <p className="mt-2 font-display text-2xl">Continue to breakfast & guest details</p>
                </div>
                <Button asChild variant="gold" size="lg" className="mt-6 gap-2 md:mt-0">
                  <Link href={buildBookUrl(room.id, search)}>
                    Continue Booking
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
