"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { BodyPortal } from "@/components/shared/BodyPortal";
import { SafeImage } from "@/components/shared/SafeImage";

export type ImageViewerItem = {
  src: string;
  alt?: string;
  title?: string;
};

interface ImageViewerProps {
  items: ImageViewerItem[];
  index: number | null;
  onClose: () => void;
  onChangeIndex?: (index: number) => void;
}

export function ImageViewer({ items, index, onClose, onChangeIndex }: ImageViewerProps) {
  const open = index !== null && items.length > 0 && Boolean(items[index]?.src);
  const current = open && index !== null ? items[index] : null;
  const start = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (index === null || items.length < 2 || !onChangeIndex) return;
      onChangeIndex((index + dir + items.length) % items.length);
    },
    [index, items.length, onChangeIndex]
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, go]);

  return (
    <BodyPortal>
      <AnimatePresence>
        {open && current ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.title || current.alt || "Image viewer"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex flex-col bg-black/96"
            onClick={onClose}
            onTouchStart={(event) => {
              start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            }}
            onTouchEnd={(event) => {
              if (!start.current) return;
              const dx = event.changedTouches[0].clientX - start.current.x;
              const dy = event.changedTouches[0].clientY - start.current.y;
              start.current = null;
              if (Math.abs(dy) > 80 && Math.abs(dy) > Math.abs(dx)) {
                onClose();
                return;
              }
              if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
                go(dx > 0 ? -1 : 1);
              }
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-3"
              style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
            >
              <p className="pointer-events-none rounded-full bg-black/45 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-white/80">
                {index !== null ? `${index + 1} / ${items.length}` : ""}
              </p>
              <button
                type="button"
                aria-label="Close image"
                onClick={(event) => {
                  event.stopPropagation();
                  onClose();
                }}
                className="pointer-events-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#0f2420] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              >
                <X className="h-5 w-5" />
                Close
              </button>
            </div>

            {items.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(event) => {
                    event.stopPropagation();
                    go(-1);
                  }}
                  className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white sm:left-5"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(event) => {
                    event.stopPropagation();
                    go(1);
                  }}
                  className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white sm:right-5"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            ) : null}

            <div
              className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-24 pt-20 sm:px-16"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative h-[70vh] w-full max-w-5xl">
                <SafeImage
                  src={current.src}
                  alt={current.alt || current.title || "Gallery image"}
                  fill
                  priority
                  fadeIn={false}
                  objectFit="contain"
                  className="object-contain"
                />
              </div>
            </div>

            {current.title ? (
              <p className="absolute inset-x-4 bottom-[max(72px,calc(env(safe-area-inset-bottom)+56px))] text-center text-sm text-white/80 sm:bottom-8">
                {current.title}
              </p>
            ) : null}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
              className="absolute inset-x-4 z-20 flex min-h-12 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#0f2420] shadow-lg sm:hidden"
              style={{ bottom: "max(16px, env(safe-area-inset-bottom))" }}
            >
              Close
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </BodyPortal>
  );
}
