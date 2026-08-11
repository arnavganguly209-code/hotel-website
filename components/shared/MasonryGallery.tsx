"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageViewer } from "@/components/shared/ImageViewer";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { cn } from "@/lib/utils";
import { GALLERY_CATEGORIES } from "@/lib/navigation";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category: string;
  aspect?: string;
}

interface MasonryGalleryProps {
  items: readonly GalleryItem[];
  columns?: 2 | 3;
  showFilters?: boolean;
}

const aspectMap: Record<string, "portrait" | "landscape" | "square"> = {
  tall: "portrait",
  wide: "landscape",
  square: "square",
};

export function MasonryGallery({ items, columns = 3, showFilters = true }: MasonryGalleryProps) {
  const [active, setActive] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(
    () =>
      category === "All"
        ? items
        : items.filter((item) => item.category.toLowerCase() === category.toLowerCase()),
    [items, category]
  );

  const viewerItems = filtered.map((item) => ({
    src: item.src,
    alt: item.title,
    title: item.title,
  }));

  return (
    <>
      {showFilters && (
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "border px-5 py-2 text-[10px] font-medium uppercase tracking-[0.2em] transition-all",
                category === cat
                  ? "border-luxury-orange bg-luxury-orange text-white"
                  : "border-luxury-orange/20 text-luxury-muted hover:border-luxury-orange/50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className={cn(
          "columns-1 gap-5 space-y-5",
          columns === 2 ? "sm:columns-2" : "sm:columns-2 lg:columns-3"
        )}
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.button
              key={item.id}
              layout
              variants={fadeUp}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setActive(filtered.findIndex((entry) => entry.id === item.id))}
              className="group relative block w-full break-inside-avoid overflow-hidden border border-luxury-orange/10 text-left luxury-card"
            >
              <MediaPlaceholder
                src={item.src}
                alt={item.title}
                label={item.category}
                variant="gallery"
                aspect={aspectMap[item.aspect ?? ""] || "landscape"}
                className="min-h-[220px]"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-luxury-green-dark/80 via-luxury-green-dark/20 to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <p className="text-[10px] uppercase tracking-[0.25em] text-luxury-orange-light">
                  {item.category}
                </p>
                <p className="mt-1 font-display text-xl text-white">{item.title}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <ImageViewer
        items={viewerItems}
        index={active}
        onClose={() => setActive(null)}
        onChangeIndex={setActive}
      />
    </>
  );
}
