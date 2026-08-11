"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { ImageViewer } from "@/components/shared/ImageViewer";
import { SafeImage } from "@/components/shared/SafeImage";
import { cn } from "@/lib/utils";
import { luxuryEase } from "@/lib/animations";

interface LuxuryRoomGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function LuxuryRoomGallery({ images, alt, className }: LuxuryRoomGalleryProps) {
  const [active, setActive] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const touchStart = useRef<number | null>(null);
  const gallery = images.filter(Boolean);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!gallery.length) return;
      setActive((i) => (i + dir + gallery.length) % gallery.length);
    },
    [gallery.length]
  );

  if (!gallery.length) {
    return (
      <div
        className={cn(
          "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[28px] border border-luxury-gold/20 bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900 shadow-luxury-lg",
          className
        )}
      >
        <div className="text-center px-6">
          <div className="mx-auto mb-3 h-px w-12 bg-luxury-gold/50" />
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-luxury-gold/80">{alt}</p>
          <p className="mt-2 text-[9px] uppercase tracking-widest text-white/30">Add gallery images in Orbit</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className="relative overflow-hidden rounded-[28px] border border-luxury-gold/20 shadow-luxury-lg"
        onTouchStart={(e) => {
          touchStart.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStart.current === null) return;
          const diff = e.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(diff) > 48) go(diff > 0 ? -1 : 1);
          touchStart.current = null;
        }}
      >
        <AnimatePresence mode="wait">
          <motion.button
            key={gallery[active]}
            type="button"
            aria-label={`View ${alt} image ${active + 1}`}
            onClick={() => setViewerIndex(active)}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: luxuryEase }}
            className="relative aspect-[4/3] w-full bg-[#0d241a]"
          >
            <SafeImage
              src={gallery[active]}
              alt={alt}
              fill
              priority={active === 0}
              fadeIn={false}
              objectFit="contain"
              className="object-contain"
            />
          </motion.button>
        </AnimatePresence>

        {gallery.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-luxury-green-dark/55 text-white backdrop-blur-md transition hover:bg-luxury-gold sm:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-luxury-green-dark/55 text-white backdrop-blur-md transition hover:bg-luxury-gold sm:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Image ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    i === active ? "w-8 bg-luxury-gold" : "w-2 bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
        <button
          type="button"
          aria-label="Open fullscreen gallery"
          onClick={() => setViewerIndex(active)}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-luxury-green-dark/55 text-white backdrop-blur-md transition hover:bg-luxury-gold sm:right-4 sm:top-4"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {gallery.length > 1 ? (
        <div className="hidden grid-cols-4 gap-2 sm:grid sm:grid-cols-5 sm:gap-3">
          {gallery.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-[14px] border transition-all duration-500",
                i === active ? "border-luxury-gold shadow-luxury-gold" : "border-white/50 opacity-75 hover:opacity-100"
              )}
            >
              <SafeImage src={src} alt="" fill fadeIn={false} className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <ImageViewer
        items={gallery.map((src) => ({ src, alt }))}
        index={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onChangeIndex={(next) => {
          setViewerIndex(next);
          setActive(next);
        }}
      />
    </div>
  );
}
