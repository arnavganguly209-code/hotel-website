"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";

export interface GalleryLightboxItem {
  id: string;
  src: string;
  title: string;
  description?: string;
  category: string;
  alt?: string;
}

interface GalleryLightboxProps {
  items: GalleryLightboxItem[];
  index: number | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
  goldColor?: string;
}

export function GalleryLightbox({
  items,
  index,
  onClose,
  onChangeIndex,
  goldColor = "#C5A059",
}: GalleryLightboxProps) {
  const [zoomed, setZoomed] = useState(false);
  const open = index !== null && items.length > 0;
  const current = open && index !== null ? items[index] : null;

  const goPrev = useCallback(() => {
    if (index === null || items.length === 0) return;
    onChangeIndex((index - 1 + items.length) % items.length);
    setZoomed(false);
  }, [index, items.length, onChangeIndex]);

  const goNext = useCallback(() => {
    if (index === null || items.length === 0) return;
    onChangeIndex((index + 1) % items.length);
    setZoomed(false);
  }, [index, items.length, onChangeIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, goPrev, goNext]);

  // Touch swipe
  useEffect(() => {
    if (!open) return;
    let startX = 0;
    let startY = 0;
    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) goPrev();
        else goNext();
      }
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [open, goPrev, goNext]);

  return (
    <AnimatePresence>
      {open && current ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex flex-col bg-[#061813]/96 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <p className="font-body text-xs uppercase tracking-[0.2em] text-white/60">
              {(index ?? 0) + 1} / {items.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/50"
                aria-label={zoomed ? "Zoom out" : "Zoom in"}
              >
                {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-12">
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition hover:border-white/50 sm:left-4"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className={`relative max-h-[70vh] w-full max-w-5xl overflow-hidden rounded-2xl ${
                zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
              style={{ border: `1px solid ${goldColor}66` }}
              onClick={() => setZoomed((z) => !z)}
            >
              <div className={`relative aspect-[16/10] w-full ${zoomed ? "scale-125" : "scale-100"} transition-transform duration-500`}>
                <SafeImage
                  src={current.src}
                  alt={current.alt || current.title}
                  fill
                  objectFit="contain"
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            </motion.div>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition hover:border-white/50 sm:right-4"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="px-4 pb-3 pt-4 text-center sm:px-6">
            <p className="font-body text-[10px] uppercase tracking-[0.28em]" style={{ color: goldColor }}>
              {current.category}
            </p>
            <h3 className="mt-1 font-display text-xl text-white sm:text-2xl">{current.title}</h3>
            {current.description ? (
              <p className="mx-auto mt-1 max-w-xl font-body text-sm text-white/65">{current.description}</p>
            ) : null}
          </div>

          <div className="flex gap-2 overflow-x-auto px-4 pb-5 sm:justify-center sm:px-6">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChangeIndex(i);
                  setZoomed(false);
                }}
                className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition"
                style={{
                  borderColor: i === index ? goldColor : "rgba(255,255,255,0.2)",
                  opacity: i === index ? 1 : 0.55,
                }}
                aria-label={`Go to ${item.title}`}
              >
                <SafeImage src={item.src} alt="" fill objectFit="cover" className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
