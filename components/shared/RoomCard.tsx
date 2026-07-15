"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bed, Maximize2, Users } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { roomDetailPath } from "@/lib/navigation";
import { luxuryEase } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface RoomCardProps {
  room: SiteContent["rooms"][number];
  goldColor?: string;
  headingColor?: string;
}

const IMAGE_HEIGHT = "h-[280px] sm:h-[300px]";

export function RoomCard({
  room,
  goldColor = "#C5A059",
  headingColor = "#062C24",
}: RoomCardProps) {
  const [imageError, setImageError] = useState(false);
  const explore = room.exploreText || "Explore Room";

  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.65, ease: luxuryEase }}
      className="group flex h-full flex-col overflow-hidden rounded-[22px] transition-shadow duration-700"
      style={{
        backgroundColor: "#FBF8F1",
        border: `1px solid ${goldColor}55`,
        boxShadow: "0 18px 42px rgba(15, 42, 34, 0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 22px 48px rgba(15, 42, 34, 0.14), 0 0 0 1px ${goldColor}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 18px 42px rgba(15, 42, 34, 0.1)";
      }}
    >
      <div className={`relative ${IMAGE_HEIGHT} w-full shrink-0 overflow-hidden`}>
        {room.imageSrc && !imageError ? (
          <SafeImage
            src={room.imageSrc}
            alt={room.name}
            fill
            objectFit="cover"
            className="object-cover object-center transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 280px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#EFE8DA]">
            <p
              className="font-display text-xs uppercase tracking-[0.3em]"
              style={{ color: `${goldColor}99` }}
            >
              {room.name}
            </p>
          </div>
        )}
        <div
          className="absolute left-3 top-3 rounded-full px-3 py-1.5 shadow-sm"
          style={{
            backgroundColor: "rgba(255,255,255,0.94)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6B736C]">
            From
          </span>
          <span
            className="ml-1 font-display text-base font-semibold"
            style={{ color: headingColor }}
          >
            ${room.price}
          </span>
          <span className="text-[9px] uppercase text-[#6B736C]"> / Night</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <h3
          className="line-clamp-2 min-h-[2.75rem] font-display text-[15px] font-semibold uppercase leading-snug tracking-[0.04em] md:text-base"
          style={{ color: headingColor }}
        >
          {room.name}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {[
            { icon: Maximize2, value: room.size },
            { icon: Users, value: room.guests },
            { icon: Bed, value: room.bedType },
          ].map(({ icon: Icon, value }) => (
            <span
              key={value}
              className="flex items-center gap-1.5 text-[11px]"
              style={{ color: goldColor }}
              title={value}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.35} />
              <span className="truncate text-[#6B736C]">{value}</span>
            </span>
          ))}
        </div>

        <p className="mt-3 line-clamp-3 flex-1 text-[13px] leading-[1.7] text-[#5A635C]">
          {room.description}
        </p>

        <Link
          href={roomDetailPath(room.id)}
          prefetch
          className="group/link mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            backgroundColor: headingColor,
            boxShadow: "0 8px 20px rgba(6, 44, 36, 0.2)",
          }}
        >
          {explore}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
}
