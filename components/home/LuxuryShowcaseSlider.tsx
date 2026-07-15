"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { luxuryEase } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

type SliderSettings = SiteContent["overview"]["slider"];

interface LuxuryShowcaseSliderProps {
  slider: SliderSettings;
  goldColor: string;
  maxHeight: number;
}

export function LuxuryShowcaseSlider({
  slider,
  goldColor,
  maxHeight,
}: LuxuryShowcaseSliderProps) {
  const slides = [...(slider.slides || [])]
    .filter((s) => s.enabled !== false && Boolean(s.src?.trim()))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, slider.maxImages || 12);

  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!count) return;
      setIndex((current) => {
        if (!slider.loop) {
          const next = current + dir;
          return Math.max(0, Math.min(count - 1, next));
        }
        return (current + dir + count) % count;
      });
    },
    [count, slider.loop]
  );

  useEffect(() => {
    setIndex(0);
  }, [count]);

  useEffect(() => {
    if (!slider.autoPlay || count <= 1) return;
    const ms = Math.max(2000, slider.slideDurationMs || 5500);
    const id = window.setInterval(() => go(1), ms);
    return () => window.clearInterval(id);
  }, [slider.autoPlay, slider.slideDurationMs, count, go, index]);

  if (!count) return null;

  const current = slides[Math.min(index, count - 1)];
  const speed = Math.max(0.35, (slider.transitionSpeedMs || 900) / 1000);

  return (
    <div className="relative w-full">
      <div
        className="relative overflow-hidden rounded-[20px] md:rounded-[26px]"
        style={{
          border: `1px solid ${goldColor}88`,
          boxShadow:
            "0 28px 64px rgba(15, 36, 32, 0.2), 0 10px 28px rgba(200, 161, 69, 0.14)",
        }}
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
          const delta = endX - touchStartX.current;
          if (Math.abs(delta) > 48) go(delta > 0 ? -1 : 1);
          touchStartX.current = null;
        }}
      >
        <div
          className="relative w-full overflow-hidden bg-[#0F2420]"
          style={{
            aspectRatio: "16 / 9",
            maxHeight,
            minHeight: 220,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id || current.src}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: speed, ease: luxuryEase }}
              className="absolute inset-0"
            >
              <SafeImage
                src={current.src}
                alt={current.alt || "Hotel showcase"}
                fill
                objectFit="cover"
                className="object-cover object-center"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority={index === 0}
              />
            </motion.div>
          </AnimatePresence>

          {slider.showArrows && count > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-500 hover:-translate-y-[52%] hover:scale-105 md:left-5 md:h-12 md:w-12"
                style={{
                  borderColor: `${goldColor}AA`,
                  backgroundColor: "rgba(15, 36, 32, 0.35)",
                  color: goldColor,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                }}
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-500 hover:-translate-y-[52%] hover:scale-105 md:right-5 md:h-12 md:w-12"
                style={{
                  borderColor: `${goldColor}AA`,
                  backgroundColor: "rgba(15, 36, 32, 0.35)",
                  color: goldColor,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                }}
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </>
          ) : null}

          {slider.showDots && count > 1 ? (
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.id || slide.src}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className="h-2 w-2 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor:
                      i === index ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                    transform: i === index ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
