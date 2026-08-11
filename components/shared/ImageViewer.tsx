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
            className="fixed inset-0 z-[500] flex h-[100dvh] w-screen flex-col bg-black"
            onClick={onClose}
            onTouchStart={(event) => {
              start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            }}
            onTouchEnd={(event) => {
              if (!start.current) return;
              const dx = event.changedTouches[0].clientX - start.current.x;
              const dy = event.changedTouches[0].clientY - start.current.y;
              start.current = null;
              if (Math.abs(dy) > 90 && Math.abs(dy) > Math.abs(dx)) {
                onClose();
                return;
              }
              if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
                go(dx > 0 ? -1 : 1);
              }
            }}
          >
            <header
              className="pointer-events-none relative z-30 flex shrink-0 items-center justify-between gap-3 px-4"
              style={{
                paddingTop: "max(12px, env(safe-area-inset-top))",
                paddingBottom: "8px",
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <p className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/80">
                {index !== null ? `${index + 1} / ${items.length}` : ""}
              </p>
              <button
                type="button"
                aria-label="Exit gallery"
                onClick={(event) => {
                  event.stopPropagation();
                  onClose();
                }}
                className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold tracking-wide text-[#0f2420] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              >
                <X className="h-4 w-4" />
                Exit
              </button>
            </header>

            <div
              className="relative min-h-0 flex-1 overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <SafeImage
                src={current.src}
                alt={current.alt || current.title || "Gallery image"}
                fill
                priority
                fadeIn={false}
                objectFit="contain"
                className="object-contain"
                sizes="100vw"
              />

              {items.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={(event) => {
                      event.stopPropagation();
                      go(-1);
                    }}
                    className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-sm sm:left-5 sm:h-12 sm:w-12"
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
                    className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-sm sm:right-5 sm:h-12 sm:w-12"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              ) : null}
            </div>

            {current.title ? (
              <p
                className="shrink-0 px-4 text-center text-xs text-white/70 sm:text-sm"
                style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
                onClick={(event) => event.stopPropagation()}
              >
                {current.title}
              </p>
            ) : (
              <div
                className="shrink-0"
                style={{ height: "max(12px, env(safe-area-inset-bottom))" }}
              />
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </BodyPortal>
  );
}
