"use client";

import { SafeImage } from "@/components/shared/SafeImage";
import type { CultureBadge } from "@/lib/cms/types";

interface HeritageImageStackProps {
  mainSrc: string;
  mainAlt: string;
  circularSrc: string;
  circularAlt: string;
  badge: CultureBadge;
  goldColor: string;
}

function renderBadgeCopy(description: string, emphasis: string, emphasisColor: string) {
  if (!emphasis || !description.includes(emphasis)) {
    return <span>{description}</span>;
  }
  const [before, after] = description.split(emphasis);
  return (
    <>
      {before}
      <span
        className="font-display text-[15px] font-semibold md:text-base"
        style={{ color: emphasisColor }}
      >
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
}: HeritageImageStackProps) {
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:mx-0 lg:max-w-none">
      {/* Circular portrait — stacks above main on mobile */}
      {circularSrc ? (
        <div className="relative z-20 mx-auto mb-[-2.5rem] h-[9.5rem] w-[9.5rem] sm:h-[11rem] sm:w-[11rem] md:mb-[-3rem] lg:absolute lg:left-[-1.25rem] lg:top-[-1.5rem] lg:mb-0 lg:h-[10.5rem] lg:w-[10.5rem] xl:h-[11.5rem] xl:w-[11.5rem]">
          <div
            className="h-full w-full overflow-hidden rounded-full bg-[#F9F6EF] p-[6px] shadow-[0_18px_40px_rgba(15,42,34,0.16)]"
            style={{ border: `1.5px solid ${goldColor}` }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-full">
              <SafeImage
                src={circularSrc}
                alt={circularAlt || "Cultural detail"}
                fill
                objectFit="cover"
                className="object-cover object-center"
                sizes="200px"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Main vertical frame */}
      <div
        className="relative z-10 aspect-[4/5] overflow-hidden rounded-[28px] shadow-[0_28px_60px_rgba(15,42,34,0.16)] sm:rounded-[32px]"
        style={{ border: `1px solid ${goldColor}99` }}
      >
        <SafeImage
          src={mainSrc}
          alt={mainAlt || "Cultural experience"}
          fill
          objectFit="cover"
          className="object-cover object-center"
          sizes="(max-width: 1024px) 90vw, 480px"
          priority
        />
      </div>

      {/* Floating experience badge */}
      {badge.enabled !== false ? (
        <div className="relative z-30 mx-auto mt-[-2.25rem] w-[min(100%,340px)] lg:absolute lg:bottom-6 lg:left-[-0.5rem] lg:mt-0 lg:w-[min(92%,340px)] xl:left-[-1rem]">
          <div className="flex items-center gap-3 rounded-2xl bg-[#FBF8F1] px-3.5 py-3.5 shadow-[0_16px_40px_rgba(15,42,34,0.14)] ring-1 ring-black/[0.04] sm:gap-4 sm:px-4 sm:py-4">
            <div
              className="relative flex h-[3.35rem] w-[3.35rem] shrink-0 items-center justify-center rounded-full sm:h-16 sm:w-16"
              style={{
                background: `radial-gradient(circle at 35% 30%, #E8D5A3 0%, ${goldColor} 55%, #8B7340 100%)`,
                boxShadow: `0 8px 20px ${goldColor}55`,
              }}
            >
              {badge.iconSrc ? (
                <SafeImage
                  src={badge.iconSrc}
                  alt=""
                  width={40}
                  height={40}
                  objectFit="contain"
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <>
                  <span
                    className="pointer-events-none absolute inset-[3px] rounded-full border"
                    style={{ borderColor: "rgba(255,255,255,0.45)" }}
                    aria-hidden
                  />
                  <span className="font-display text-lg font-bold leading-none text-[#062C24] sm:text-xl">
                    {badge.number || "20+"}
                  </span>
                </>
              )}
            </div>
            <p
              className="min-w-0 font-body text-[12px] leading-[1.55] text-[#4A554E] sm:text-[13px]"
              style={{ color: "#4A554E" }}
            >
              {renderBadgeCopy(
                badge.description,
                badge.emphasis || badge.number,
                "#062C24"
              )}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
