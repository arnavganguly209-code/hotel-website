"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import {
  GalleryLightbox,
  type GalleryLightboxItem,
} from "@/components/shared/GalleryLightbox";
import { cn } from "@/lib/utils";
import { luxuryFadeUp, luxuryStagger } from "@/lib/animations";

interface LuxuryGalleryGridProps {
  items: GalleryLightboxItem[];
  categories: string[];
  showFilters?: boolean;
  columns?: 2 | 3 | 4;
  goldColor?: string;
  headingColor?: string;
  borderColor?: string;
  initialVisible?: number;
  loadMoreCount?: number;
  loadMoreLabel?: string;
}

const HEIGHT_VARIANTS = [
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-[4/3]",
  "aspect-[5/6]",
  "aspect-square",
  "aspect-[3/5]",
];

export function LuxuryGalleryGrid({
  items,
  categories,
  showFilters = true,
  columns = 4,
  goldColor = "#C5A059",
  headingColor = "#062C24",
  borderColor,
  initialVisible = 8,
  loadMoreCount = 8,
  loadMoreLabel = "Load More Images",
}: LuxuryGalleryGridProps) {
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(initialVisible);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const border = borderColor || `${goldColor}88`;

  useEffect(() => {
    setVisible(initialVisible);
  }, [category, initialVisible]);

  const filtered = useMemo(
    () =>
      category === "All"
        ? items
        : items.filter((item) => item.category.toLowerCase() === category.toLowerCase()),
    [items, category]
  );

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;
  const filterLabels = ["All", ...categories.filter((c) => c && c !== "All")];

  const columnClass =
    columns === 2
      ? "sm:columns-2"
      : columns === 4
        ? "sm:columns-2 lg:columns-3 xl:columns-4"
        : "sm:columns-2 lg:columns-3";

  const openLightbox = (itemId: string) => {
    const idx = filtered.findIndex((g) => g.id === itemId);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  return (
    <>
      {showFilters ? (
        <div className="mb-10 flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {filterLabels.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full border px-5 py-2.5 font-body text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-md"
                )}
                style={{
                  borderColor: active ? goldColor : `${goldColor}44`,
                  backgroundColor: active ? goldColor : "transparent",
                  color: active ? "#FFFFFF" : headingColor,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      ) : null}

      <motion.div
        variants={luxuryStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className={cn("columns-1 gap-5 space-y-5", columnClass)}
      >
        <AnimatePresence mode="popLayout">
          {shown.map((item, i) => {
            const heightClass = HEIGHT_VARIANTS[i % HEIGHT_VARIANTS.length];
            const isVideo = item.type === "video";
            return (
              <motion.button
                key={item.id}
                layout
                variants={luxuryFadeUp}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                type="button"
                onClick={() => openLightbox(item.id)}
                className="group relative mb-5 block w-full break-inside-avoid overflow-hidden text-left"
                style={{
                  borderRadius: 18,
                  border: `1.5px solid ${border}`,
                  boxShadow: "0 22px 48px rgba(15, 42, 34, 0.12)",
                }}
              >
                <div className={cn("relative overflow-hidden", heightClass)}>
                  <SafeImage
                    src={isVideo ? item.poster || item.src : item.src}
                    alt={item.alt || item.title}
                    fill
                    objectFit="cover"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                  {isVideo ? (
                    <span
                      className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-black/35 backdrop-blur-sm transition duration-500 group-hover:scale-110"
                      style={{ borderColor: goldColor }}
                    >
                      <Play className="ml-0.5 h-6 w-6 text-white" fill="white" />
                    </span>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p
                      className="inline-block rounded-full border px-2.5 py-0.5 font-body text-[9px] font-semibold uppercase tracking-[0.22em]"
                      style={{
                        color: goldColor,
                        borderColor: `${goldColor}66`,
                        backgroundColor: "rgba(0,0,0,0.35)",
                      }}
                    >
                      {item.category}
                      {isVideo ? " · Video" : ""}
                    </p>
                    <p className="mt-2 font-display text-lg font-semibold tracking-[0.02em] text-white sm:text-xl">
                      {item.title}
                    </p>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 font-body text-sm text-white/80">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center font-body text-sm" style={{ color: headingColor }}>
          No images in this category yet.
        </p>
      ) : null}

      {hasMore ? (
        <div className="mt-12 flex justify-center">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setVisible((v) => v + loadMoreCount)}
            className="rounded-full px-10 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition shadow-lg"
            style={{ backgroundColor: goldColor }}
          >
            {loadMoreLabel}
          </motion.button>
        </div>
      ) : null}

      <GalleryLightbox
        items={filtered}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
        goldColor={goldColor}
      />
    </>
  );
}
