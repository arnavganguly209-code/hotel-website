"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RoomCard } from "@/components/shared/RoomCard";
import { MotionSection } from "@/components/shared/MotionSection";
import { staggerContainer, fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";
import { defaultContent } from "@/lib/cms/default-content";

interface RoomsSectionProps {
  rooms: SiteContent["rooms"];
  section?: SiteContent["roomsSection"];
}

export function RoomsSection({ rooms, section = defaultContent.roomsSection }: RoomsSectionProps) {
  return (
    <MotionSection
      id="rooms"
      className="section-padding section-glow relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #EAF2E8 0%, #FFF9F2 50%, #FAF6EE 100%)" }}
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-luxury-gold-label"
            >
              {section.eyebrow}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl font-normal text-luxury-forest md:text-4xl lg:text-5xl"
            >
              {section.title}
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <Button variant="gold" asChild>
              <Link href={section.ctaHref}>{section.ctaText}</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4"
        >
          {rooms.map((room) => (
            <motion.div key={room.id} variants={fadeUp} className="h-full">
              <RoomCard room={room} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </MotionSection>
  );
}
