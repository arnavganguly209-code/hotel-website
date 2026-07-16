"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
}

export function LuxuryGalleryGrid({
  items,
  categories,
  showFilters = true,
  columns = 3,
  goldColor = "#C5A059",
  headingColor = "#062C24",
  borderColor,
}: LuxuryGalleryGridProps) {
  const [category, setCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const border = borderColor || `${goldColor}88`;

  const filtered = useMemo(
    () =>
      category === "All"
        ? items
        : items.filter((item) => item.category.toLowerCase() === category.toLowerCase()),
    [items, category]
  );

  const filterLabels = ["All", ...categories.filter((c) => c && c !== "All")];

  const columnClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";

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
                  "rounded-full border px-5 py-2 font-body text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-300"
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
        className={cn("grid grid-cols-1 gap-5", columnClass)}
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => {
            const globalIndex = items.findIndex((g) => g.id === item.id);
            return (
              <motion.button
                key={item.id}
                layout
                variants={luxuryFadeUp}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                type="button"
                onClick={() => setLightboxIndex(globalIndex >= 0 ? globalIndex : 0)}
                className="group relative overflow-hidden text-left"
                style={{
                  borderRadius: 18,
                  border: `1px solid ${border}`,
                  boxShadow: "0 22px 48px rgba(15, 42, 34, 0.12)",
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SafeImage
                    src={item.src}
                    alt={item.alt || item.title}
                    fill
                    objectFit="cover"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p
                      className="font-body text-[10px] font-semibold uppercase tracking-[0.24em]"
                      style={{ color: goldColor }}
                    >
                      {item.category}
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold uppercase tracking-[0.03em] text-white sm:text-xl">
                      {item.title}
                    </p>
                    {item.description ? (
                      <p className="mt-1 font-body text-sm text-white/80">{item.description}</p>
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

      <GalleryLightbox
        items={items}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
        goldColor={goldColor}
      />
    </>
  );
}
