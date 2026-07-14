"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const touchStart = useRef<number | null>(null);
  const gallery = images.length ? images : ["/media/rooms/super-deluxe.jpg"];

  const go = (dir: -1 | 1) => {
    setActive((i) => (i + dir + gallery.length) % gallery.length);
  };

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
              <SafeImage src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
