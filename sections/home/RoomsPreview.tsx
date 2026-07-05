"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { RoomCard } from "@/components/shared/RoomCard";
import { SectionPreviewLink } from "@/components/shared/SectionPreviewLink";
import { defaultContent } from "@/lib/cms/default-content";
import { enrichRoom } from "@/lib/cms/room-helpers";
import { ROOMS } from "@/lib/data";
import { roomImages } from "@/lib/media";
import { routes } from "@/lib/navigation";
import { staggerContainer } from "@/lib/animations";

export function RoomsPreview() {
  return (
    <section id="rooms" className="relative px-6 py-28 lg:px-8 lg:py-36">
      <div className="absolute inset-0 bg-luxury-cream" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Accommodations"
          title="Rooms & Suites"
          description="Sanctuaries of refined comfort, designed for discerning travelers."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 lg:grid-cols-2"
        >
          {ROOMS.slice(0, 2).map((room) => {
            const defaults =
              defaultContent.rooms.find((entry) => entry.id === room.id) ?? defaultContent.rooms[0];
            return (
              <RoomCard
                key={room.id}
                room={enrichRoom(defaults, {
                  name: room.name,
                  price: room.price,
                  description: room.description,
                  imageSrc: roomImages[room.id] ?? defaults.imageSrc,
                })}
              />
            );
          })}
        </motion.div>
        <SectionPreviewLink href={routes.rooms} label="Explore All Rooms" />
      </div>
    </section>
  );
}
