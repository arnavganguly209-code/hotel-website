"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bath,
  Maximize2,
  Trees,
  Tv,
  Volume2,
  Wifi,
  Wind,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { hasMediaSrc } from "@/lib/cms/media-url";
import { roomDetailPath } from "@/lib/navigation";
import { luxuryEase } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface RoomCardProps {
  room: SiteContent["rooms"][number];
  goldColor?: string;
  headingColor?: string;
}

function featureIcon(label: string): LucideIcon {
  const t = label.toLowerCase();
  if (t.includes("m²") || t.includes("m2") || t.includes("sq")) return Maximize2;
  if (t.includes("view") || t.includes("garden")) return Trees;
  if (t.includes("air") || t.includes("climate") || t.includes("ac")) return Wind;
  if (t.includes("bath")) return Bath;
  if (t.includes("tv") || t.includes("screen")) return Tv;
  if (t.includes("sound")) return Volume2;
  if (t.includes("mini") || t.includes("bar")) return Wine;
  if (t.includes("wifi") || t.includes("wi-fi")) return Wifi;
  return Maximize2;
}

function buildFeatureList(room: SiteContent["rooms"][number]): string[] {
  const fromAmenities = (room.amenities || []).filter(Boolean);
  const fromFeatures = (room.features || []).filter(Boolean);
  const pool = fromAmenities.length >= 4 ? fromAmenities : fromFeatures;
  const withSize = room.size ? [room.size, ...pool.filter((item) => item !== room.size)] : pool;
  // Prefer a clean 8-item amenity grid like the design reference
  const unique = Array.from(new Set(withSize));
  return unique.slice(0, 8);
}

export function RoomCard({
  room,
  goldColor = "#C5A059",
  headingColor = "#062C24",
}: RoomCardProps) {
  const explore = room.exploreText || "Explore Room";
  const hasImage = hasMediaSrc(room.imageSrc);
  const features = buildFeatureList(room);
  const detailHref = roomDetailPath(room.slug || room.id);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.55, ease: luxuryEase }}
      className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-white"
      style={{
        border: `1px solid ${goldColor}33`,
        boxShadow: "0 16px 40px rgba(6, 44, 36, 0.08)",
      }}
    >
      <div className="relative h-[220px] w-full shrink-0 overflow-hidden sm:h-[240px]">
        {hasImage ? (
          <SafeImage
            src={room.imageSrc}
            alt={room.seo?.altText || room.name}
            fill
            fadeIn={false}
            objectFit="cover"
            className="object-cover object-center transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
          className="absolute left-3 top-3 rounded-sm px-3 py-2"
          style={{
            backgroundColor: headingColor,
            border: `1.5px solid ${goldColor}`,
            boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
          }}
        >
          <p
            className="font-display text-[15px] font-semibold leading-none tracking-wide sm:text-base"
            style={{ color: goldColor }}
          >
            ${room.price}{" "}
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">/ Night</span>
          </p>
          <p className="mt-1 text-[9px] leading-none text-white/85">Includes taxes and fees</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-6 pt-5 sm:px-6">
        <h3
          className="text-center font-display text-[15px] font-semibold uppercase leading-snug tracking-[0.06em] sm:text-base"
          style={{ color: headingColor }}
        >
          {room.name}
        </h3>

        <div className="mt-3 flex items-center justify-center gap-2.5" aria-hidden>
          <span className="h-px w-8" style={{ backgroundColor: `${goldColor}99` }} />
          <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: goldColor }} />
          <span className="h-px w-8" style={{ backgroundColor: `${goldColor}99` }} />
        </div>

        <ul className="mt-5 grid flex-1 grid-cols-2 gap-x-3 gap-y-2.5">
          {features.map((label) => {
            const Icon = featureIcon(label);
            return (
              <li key={label} className="flex min-w-0 items-center gap-2">
                <Icon
                  className="h-3.5 w-3.5 shrink-0"
                  strokeWidth={1.6}
                  style={{ color: goldColor }}
                />
                <span
                  className="truncate text-[11px] leading-tight sm:text-xs"
                  style={{ color: headingColor }}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex justify-center">
          <Link
            href={detailHref}
            prefetch
            className="group/link inline-flex items-center justify-center gap-2 rounded-full px-7 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              backgroundColor: headingColor,
              color: goldColor,
              boxShadow: "0 8px 20px rgba(6, 44, 36, 0.22)",
            }}
          >
            {explore}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
