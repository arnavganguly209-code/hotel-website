"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Maximize2, Users, CreditCard, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuxuryRoomGallery } from "@/components/booking/LuxuryRoomGallery";
import { LuxuryBookingCheckout } from "@/components/booking/LuxuryBookingCheckout";
import { fadeUp, luxuryStagger } from "@/lib/animations";
import { buildBookUrl, calculateNights, formatBookingDate } from "@/lib/booking/utils";
import { routes } from "@/lib/navigation";
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
  const roomTotal = room.price * nights;

  if (showCheckout && search) {
    return (
      <section className="section-padding bg-gradient-to-b from-luxury-cream-light to-luxury-sage/20">
        <LuxuryBookingCheckout room={room} booking={booking} search={search} />
      </section>
    );
  }

  return (
    <section className="section-padding bg-gradient-to-b from-luxury-cream-light via-white to-luxury-sage/25">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
          <div className="space-y-20">
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
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${room.available !== false ? "bg-luxury-gold/15 text-luxury-gold" : "bg-red-100 text-red-600"}`}
                  >
                    {room.available !== false ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className="my-6 h-px w-20 bg-gradient-to-r from-luxury-gold to-transparent" />
                <p className="text-base leading-[1.85] text-luxury-muted">{room.longDescription}</p>
              </motion.div>
            </div>

            <motion.div
              variants={luxuryStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div>
                <h2 className="font-display text-2xl text-luxury-forest">Room Features</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
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
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
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
            </motion.div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="overflow-hidden rounded-[28px] border border-luxury-gold/25 shadow-float"
              style={{
                background: "linear-gradient(160deg, rgba(36,71,54,0.97) 0%, rgba(24,52,38,0.95) 100%)",
              }}
            >
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-luxury-gold">Reservation Summary</p>
                <p className="mt-2 font-display text-2xl text-white">{room.name}</p>
              </div>

              <div className="space-y-4 px-6 py-5 text-sm text-white/85">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Rate per night</span>
                  <span className="font-display text-xl text-luxury-gold">${room.price}</span>
                </div>
                {hasSearch && search ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Stay</span>
                      <span>
                        {formatBookingDate(search.checkIn)} — {formatBookingDate(search.checkOut)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Duration</span>
                      <span>
                        {nights} {nights === 1 ? "night" : "nights"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="font-semibold text-white">Estimated total</span>
                      <span className="font-display text-2xl text-luxury-gold">${roomTotal}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs leading-relaxed text-white/55">
                    Select dates on the homepage to see your personalised stay summary and proceed to booking.
                  </p>
                )}
              </div>

              <div className="space-y-3 border-t border-white/10 px-6 py-5">
                {hasSearch && search ? (
                  <Button asChild variant="gold" size="lg" className="w-full gap-2 uppercase tracking-[0.14em]">
                    <Link href={buildBookUrl(room.id, search)} prefetch>
                      Book Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="gold" size="lg" className="w-full gap-2 uppercase tracking-[0.14em]">
                    <Link href={routes.home} prefetch>
                      Check Availability
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-2 text-center text-[10px] uppercase tracking-[0.14em] text-white/70">
                  <div className="flex flex-col items-center gap-1.5 rounded-[14px] border border-white/10 bg-white/5 px-2 py-3">
                    <Building2 className="h-4 w-4 text-luxury-gold" />
                    Pay at Hotel
                  </div>
                  <div className="flex flex-col items-center gap-1.5 rounded-[14px] border border-white/10 bg-white/5 px-2 py-3">
                    <CreditCard className="h-4 w-4 text-luxury-gold" />
                    Pay Online
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </section>
  );
}
