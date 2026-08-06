"use client";

import Link from "next/link";
import { SafeImage } from "@/components/shared/SafeImage";
import type { CultureBadge } from "@/lib/cms/types";

interface HeritageImageStackProps {
  mainSrc: string;
  mainAlt: string;
  circularSrc: string;
  circularAlt: string;
  badge: CultureBadge;
  goldColor: string;
  /** When set, entire image composition is clickable */
  href?: string;
}

function renderBadgeCopy(description: string, emphasis: string, emphasisColor: string) {
  if (!emphasis || !description.includes(emphasis)) {
    return <span>{description}</span>;
  }
  const [before, after] = description.split(emphasis);
  return (
    <>
      {before}
      <span className="font-display text-[14px] font-semibold md:text-[15px]" style={{ color: emphasisColor }}>
        {emphasis}
      </span>
      {after}
    </>
  );
}

export function HeritageImageStack({
  mainSrc,
  mainAlt,
  circularSrc,
  circularAlt,
  badge,
  goldColor,
  href,
}: HeritageImageStackProps) {
  const frame = (
    <div className="group/image relative mx-auto w-full max-w-[520px] lg:mx-0 lg:max-w-none">
      {/* Main frame — top-aligned, premium glass edge */}
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-[22px] shadow-[0_24px_56px_rgba(15,42,34,0.18)] transition-shadow duration-700 group-hover/image:shadow-[0_32px_64px_rgba(15,42,34,0.24)] sm:rounded-[26px]"
        style={{
          border: `1px solid ${goldColor}AA`,
          boxShadow: `0 24px 56px rgba(15,42,34,0.18), inset 0 1px 0 rgba(255,255,255,0.22)`,
        }}
      >
        <SafeImage
          src={mainSrc}
          alt={mainAlt || "Cultural experience"}
          fill
          objectFit="cover"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover/image:scale-[1.04]"
          sizes="(max-width: 1024px) 90vw, 480px"
          priority
        />
        {/* Soft glass sheen */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#062C24]/35 via-transparent to-white/10"
          aria-hidden
        />
      </div>

      {/* Circular cultural detail — attached top-left corner */}
      {circularSrc ? (
        <div className="absolute -left-2 -top-3 z-20 h-[5.5rem] w-[5.5rem] sm:-left-3 sm:-top-4 sm:h-[6.75rem] sm:w-[6.75rem] lg:-left-4 lg:-top-5 lg:h-[7.5rem] lg:w-[7.5rem]">
          <div
            className="h-full w-full overflow-hidden rounded-full bg-[#F9F6EF] p-[5px] shadow-[0_14px_32px_rgba(15,42,34,0.18)]"
            style={{ border: `1.5px solid ${goldColor}` }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-full">
              <SafeImage
                src={circularSrc}
                alt={circularAlt || "Cultural detail"}
                fill
                objectFit="cover"
                className="object-cover object-center"
                sizes="140px"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Experience badge — attached bottom-left of frame */}
      {badge.enabled !== false ? (
        <div className="absolute -bottom-3 left-3 z-30 w-[min(88%,300px)] sm:left-4 lg:-bottom-4 lg:left-5 lg:w-[min(90%,320px)]">
          <div
            className="flex items-center gap-3 rounded-2xl px-3.5 py-3 shadow-[0_16px_40px_rgba(15,42,34,0.16)] backdrop-blur-md sm:gap-3.5 sm:px-4 sm:py-3.5"
            style={{
              background: "rgba(251,248,241,0.94)",
              border: `1px solid ${goldColor}88`,
            }}
          >
            <div
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14"
              style={{
                background: `radial-gradient(circle at 35% 30%, #E8D5A3 0%, ${goldColor} 55%, #8B7340 100%)`,
                boxShadow: `0 8px 18px ${goldColor}55`,
              }}
            >
              {badge.iconSrc ? (
                <SafeImage
                  src={badge.iconSrc}
                  alt=""
                  width={36}
                  height={36}
                  objectFit="contain"
                  className="h-7 w-7 object-contain"
                />
              ) : (
                <span className="font-display text-base font-bold leading-none text-[#062C24] sm:text-lg">
                  {badge.number || "20+"}
                </span>
              )}
            </div>
            <p className="min-w-0 font-body text-[11px] leading-[1.5] text-[#4A554E] sm:text-[12px]">
              {renderBadgeCopy(badge.description, badge.emphasis || badge.number, "#062C24")}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} prefetch className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/50" aria-label={mainAlt || "Cultural experience"}>
        {frame}
      </Link>
    );
  }

  return frame;
}
