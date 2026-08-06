"use client";

import Link from "next/link";
import { SafeImage } from "@/components/shared/SafeImage";
import { cn } from "@/lib/utils";
import type { CultureBadge } from "@/lib/cms/types";

interface HeritageImageStackProps {
  mainSrc: string;
  mainAlt: string;
  circularSrc: string;
  circularAlt: string;
  badge: CultureBadge;
  goldColor: string;
  headingColor?: string;
  /** When set, entire image composition is clickable */
  href?: string;
  className?: string;
}

function renderBadgeCopy(description: string, emphasis: string) {
  if (!emphasis || !description.includes(emphasis)) {
    return <span>{description}</span>;
  }
  const [before, after] = description.split(emphasis);
  return (
    <>
      {before}
      <span className="font-semibold text-[#F5F0E6]">{emphasis}</span>
      {after}
    </>
  );
}

/**
 * Heritage image — fills parent height on desktop so tops/bottoms
 * align with the right content column (no hanging frame).
 */
export function HeritageImageStack({
  mainSrc,
  mainAlt,
  circularSrc,
  circularAlt,
  badge,
  goldColor,
  headingColor = "#062C24",
  href,
  className,
}: HeritageImageStackProps) {
  const frame = (
    <div
      className={cn(
        "group/image relative mx-auto w-full max-w-[520px] lg:mx-0 lg:h-full lg:max-w-none",
        className
      )}
    >
      {/* Frame fills column height on lg; fixed aspect on mobile only */}
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-[20px] sm:rounded-[24px] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
        style={{
          border: `1px solid ${goldColor}AA`,
          boxShadow:
            "0 22px 48px rgba(15,42,34,0.16), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        <SafeImage
          src={mainSrc}
          alt={mainAlt || "Cultural experience"}
          fill
          objectFit="cover"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover/image:scale-[1.03]"
          sizes="(max-width: 1024px) 90vw, 520px"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#062C24]/55 via-transparent to-white/[0.06]"
          aria-hidden
        />

        {/* Experience badge — INSIDE bottom of frame (matches reference) */}
        {badge.enabled !== false ? (
          <div
            className="absolute bottom-3 left-3 right-3 z-20 sm:bottom-4 sm:left-4 sm:right-4"
          >
            <div
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 sm:gap-4 sm:px-4 sm:py-3.5"
              style={{
                background: `${headingColor}F2`,
                border: `1px solid ${goldColor}99`,
                boxShadow: "0 12px 28px rgba(6,44,36,0.28)",
              }}
            >
              <p
                className="shrink-0 font-display text-[1.35rem] font-semibold leading-none tracking-wide sm:text-[1.55rem]"
                style={{ color: goldColor }}
              >
                {badge.number || "20+"}
                <span className="ml-1 text-[0.55em] font-medium tracking-[0.12em]">
                  YEARS
                </span>
              </p>
              <span
                className="hidden h-8 w-px shrink-0 sm:block"
                style={{ backgroundColor: `${goldColor}88` }}
                aria-hidden
              />
              <p className="min-w-0 font-body text-[11px] leading-[1.45] text-[#E8E4D8] sm:text-[12px]">
                {renderBadgeCopy(badge.description, badge.emphasis || badge.number)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Circular detail — overlaps top-left, inside margin of frame */}
      {circularSrc ? (
        <div className="absolute left-3 top-3 z-20 h-[4.75rem] w-[4.75rem] sm:left-4 sm:top-4 sm:h-[5.75rem] sm:w-[5.75rem] lg:left-5 lg:top-5 lg:h-[6.25rem] lg:w-[6.25rem]">
          <div
            className="h-full w-full overflow-hidden rounded-full bg-[#F9F6EF] p-[4px] shadow-[0_12px_28px_rgba(15,42,34,0.2)]"
            style={{ border: `1.5px solid ${goldColor}` }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-full">
              <SafeImage
                src={circularSrc}
                alt={circularAlt || "Cultural detail"}
                fill
                objectFit="cover"
                className="object-cover object-center"
                sizes="120px"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        prefetch
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/50"
        aria-label={mainAlt || "Cultural experience"}
      >
        {frame}
      </Link>
    );
  }

  return frame;
}
