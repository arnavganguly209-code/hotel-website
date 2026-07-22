"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, X } from "lucide-react";
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
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const touchStart = useRef<number | null>(null);
  const gallery = images.filter(Boolean);

  const go = useCallback((dir: -1 | 1) => {
    if (!gallery.length) return;
    setActive((i) => (i + dir + gallery.length) % gallery.length);
    setZoom(1);
  }, [gallery.length]);

  useEffect(() => {
    if (!fullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreen, go]);

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
          <motion.div
            key={gallery[active]}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: luxuryEase }}
            className="relative aspect-[4/3] w-full"
          >
            <SafeImage
              src={gallery[active]}
              alt={alt}
              fill
              priority={active === 0}
              fadeIn={false}
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-green-dark/35 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {gallery.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-luxury-green-dark/55 text-white backdrop-blur-md transition hover:bg-luxury-gold"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-luxury-green-dark/55 text-white backdrop-blur-md transition hover:bg-luxury-gold"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
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
          onClick={() => setFullscreen(true)}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-luxury-green-dark/55 text-white backdrop-blur-md transition hover:bg-luxury-gold"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {gallery.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
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

      <AnimatePresence>
        {fullscreen ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${alt} fullscreen gallery`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex touch-none items-center justify-center bg-[#07120d]/96 p-3 sm:p-8"
            onTouchStart={(e) => {
              touchStart.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStart.current === null || zoom > 1) return;
              const diff = e.changedTouches[0].clientX - touchStart.current;
              if (Math.abs(diff) > 48) go(diff > 0 ? -1 : 1);
              touchStart.current = null;
            }}
          >
            <div className="absolute right-3 top-3 z-20 flex gap-2 sm:right-6 sm:top-6">
              <button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(1, value - 0.5))} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md"><Minus className="h-5 w-5" /></button>
              <button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(3, value + 0.5))} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md"><Plus className="h-5 w-5" /></button>
              <button type="button" aria-label="Close fullscreen gallery" onClick={() => setFullscreen(false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md"><X className="h-5 w-5" /></button>
            </div>

            <button type="button" aria-label="Previous image" onClick={() => go(-1)} className="absolute left-3 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white sm:left-6"><ChevronLeft /></button>
            <div className="relative h-[78vh] w-[88vw] overflow-auto">
              <SafeImage
                src={gallery[active]}
                alt={`${alt} — image ${active + 1} of ${gallery.length}`}
                fill
                priority
                fadeIn={false}
                objectFit="contain"
                className="transition-transform duration-300"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
            <button type="button" aria-label="Next image" onClick={() => go(1)} className="absolute right-3 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white sm:right-6"><ChevronRight /></button>
            <p className="absolute bottom-4 text-xs uppercase tracking-[0.2em] text-white/65">{active + 1} / {gallery.length}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
