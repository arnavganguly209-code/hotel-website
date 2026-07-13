"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bed, Maximize2, Users } from "lucide-react";
import { roomDetailPath } from "@/lib/navigation";
import { luxuryEase } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface RoomCardProps {
  room: SiteContent["rooms"][number];
}

const IMAGE_HEIGHT = "h-[300px] sm:h-[320px]";

export function RoomCard({ room }: RoomCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.65, ease: luxuryEase }}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-white/60 backdrop-blur-[22px] transition-shadow duration-700 hover:shadow-float"
      style={{
        background: "linear-gradient(160deg, rgba(255,249,242,0.92) 0%, rgba(234,242,232,0.78) 100%)",
        boxShadow: "0 22px 60px rgba(24,56,47,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
      }}
    >
      <div className={`relative ${IMAGE_HEIGHT} w-full shrink-0 overflow-hidden`}>
        {room.imageSrc && !imageError ? (
          <Image
            src={room.imageSrc}
            alt={room.name}
            fill
            className="object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-luxury-cream via-luxury-champagne to-luxury-sage">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-luxury-gold/70">{room.name}</p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-forest/30 via-transparent to-transparent opacity-60" />
        <div
          className="absolute left-4 top-4 rounded-[14px] border border-white/50 px-3 py-2 backdrop-blur-md"
          style={{ background: "rgba(255,249,242,0.88)" }}
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-luxury-muted">From</span>
          <span className="ml-1 font-display text-lg font-medium text-luxury-forest">${room.price}</span>
          <span className="text-[9px] uppercase text-luxury-muted"> / Night</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="line-clamp-2 min-h-[3.25rem] font-display text-lg leading-snug text-luxury-forest transition-colors duration-500 group-hover:text-luxury-gold md:text-xl">
          {room.name}
        </h3>

        <div className="mt-4 grid min-h-[52px] grid-cols-1 gap-2 border-b border-luxury-gold/12 pb-4 sm:grid-cols-3 sm:gap-1">
          {[
            { icon: Maximize2, value: room.size },
            { icon: Users, value: room.guests },
            { icon: Bed, value: room.bedType },
          ].map(({ icon: Icon, value }) => (
            <span
              key={value}
              className="flex items-center gap-1.5 truncate text-[11px] text-luxury-muted"
              title={value}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-luxury-gold" strokeWidth={1.25} />
              <span className="truncate">{value}</span>
            </span>
          ))}
        </div>

        <div className="relative mt-4 flex-1">
          <p className="line-clamp-4 text-sm leading-[1.75] text-luxury-muted">{room.description}</p>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8"
            style={{
              background: "linear-gradient(to bottom, transparent, rgba(250,246,238,0.98))",
            }}
            aria-hidden
          />
        </div>

        <Link
          href={roomDetailPath(room.id)}
          prefetch
          className="group/link mt-auto inline-flex items-center gap-2.5 rounded-full border border-luxury-gold/25 bg-luxury-forest px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-500 hover:-translate-y-0.5 hover:border-luxury-gold/50 hover:bg-luxury-green-dark hover:shadow-lg"
        >
          Explore Room
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
}
