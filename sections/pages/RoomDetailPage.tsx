"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Maximize2, Users } from "lucide-react";
import { LuxuryMediaFrame } from "@/components/shared/LuxuryMediaFrame";
import { RoomBookingForm } from "@/components/booking/RoomBookingForm";
import { fadeUp, luxuryStagger } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface RoomDetailPageProps {
  room: SiteContent["rooms"][number];
  booking: SiteContent["roomBooking"];
}

export function RoomDetailPage({ room, booking }: RoomDetailPageProps) {
  const [activeImage, setActiveImage] = useState(0);
  const gallery = room.gallery.length ? room.gallery : [room.imageSrc];

  return (
    <section className="section-padding bg-gradient-to-b from-luxury-cream-light via-white to-luxury-sage/25">
      <div className="mx-auto max-w-7xl space-y-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <LuxuryMediaFrame
              media={{
                type: "image",
                imageSrc: gallery[activeImage],
                videoSrc: "",
                poster: "",
                alt: room.name,
                caption: room.name,
              }}
              aspectClass="aspect-[4/3]"
              roundedClass="rounded-[28px]"
            />
            {gallery.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`overflow-hidden rounded-[14px] border transition-all duration-500 ${
                      i === activeImage ? "border-luxury-gold shadow-luxury-gold" : "border-white/50 opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
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
              <span className="font-display text-luxury-gold">
                From ${room.price}
                <span className="text-xs text-luxury-muted"> / night</span>
              </span>
            </div>
            <div className="my-6 h-px w-20 bg-gradient-to-r from-luxury-gold to-transparent" />
            <p className="text-base leading-[1.85] text-luxury-muted">{room.longDescription}</p>
          </motion.div>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          <motion.div
            variants={luxuryStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-10"
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
              <h2 className="font-display text-2xl text-luxury-forest">Amenities</h2>
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

          <RoomBookingForm room={room} booking={booking} />
        </div>
      </div>
    </section>
  );
}
