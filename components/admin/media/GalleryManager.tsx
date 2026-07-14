"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/AdminFields";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import { SafeImage } from "@/components/shared/SafeImage";
import { GALLERY_DISPLAY_CATEGORIES } from "@/lib/cms/media-categories";
import type { MediaAsset, SiteContent } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

type GalleryItem = SiteContent["gallery"][number];

interface GalleryManagerProps {
  gallery: GalleryItem[];
  onChange: (gallery: GalleryItem[]) => void;
  library: MediaAsset[];
  onLibraryChange: (library: MediaAsset[]) => void;
  sectionTitle: string;
  sectionDescription: string;
  onSectionMetaChange: (meta: { title: string; description: string }) => void;
}

export function GalleryManager({
  gallery,
  onChange,
  library,
  onLibraryChange,
  sectionTitle,
  sectionDescription,
  onSectionMetaChange,
}: GalleryManagerProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const sorted = [...gallery].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const patch = (id: string, data: Partial<GalleryItem>) => {
    onChange(gallery.map((item) => (item.id === id ? { ...item, ...data } : item)));
  };

  const addItem = () => {
    const order = gallery.length ? Math.max(...gallery.map((g) => g.order ?? 0)) + 1 : 0;
    onChange([
      ...gallery,
      {
        id: `g-${Date.now()}`,
        src: "",
        title: "New Gallery Image",
        category: "Hotel",
        type: "image",
        alt: "",
        active: true,
        order,
      },
    ]);
  };

  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    const next = [...sorted];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next.map((item, i) => ({ ...item, order: i })));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <AdminInput
          label="Section Title"
          value={sectionTitle}
          onChange={(e) => onSectionMetaChange({ title: e.target.value, description: sectionDescription })}
        />
        <AdminInput
          label="Section Description"
          value={sectionDescription}
          onChange={(e) => onSectionMetaChange({ title: sectionTitle, description: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">{gallery.length} gallery images · drag to reorder</p>
        <Button type="button" variant="gold" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4" />
          Add Gallery Image
        </Button>
      </div>

      <div className="space-y-4">
        {sorted.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) reorder(dragIndex, index);
              setDragIndex(null);
            }}
            className={cn(
              "rounded-2xl border border-luxury-gold/15 bg-black/20 p-4 transition",
              dragIndex === index && "opacity-60",
              item.active === false && "opacity-50"
            )}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-white/50">
                <GripVertical className="h-5 w-5 cursor-grab" />
                <span className="text-xs uppercase tracking-wider">#{index + 1}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={item.active !== false}
                    onChange={(e) => patch(item.id, { active: e.target.checked })}
                    className="rounded border-luxury-gold/40"
                  />
                  Active
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-red-400"
                  onClick={() => onChange(gallery.filter((g) => g.id !== item.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-black/30">
                {item.src ? (
                  <SafeImage src={item.src} alt={item.alt || item.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-white/30">No image</div>
                )}
              </div>
              <div className="space-y-3">
                <ImagePicker
                  label="Gallery Image"
                  value={item.src}
                  category="Gallery"
                  folder="gallery"
                  library={library}
                  onLibraryChange={onLibraryChange}
                  onChange={(url) => patch(item.id, { src: url })}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminInput
                    label="Title"
                    value={item.title}
                    onChange={(e) => patch(item.id, { title: e.target.value })}
                  />
                  <div>
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.2em] text-luxury-gold/70">
                      Category
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) => patch(item.id, { category: e.target.value })}
                      className="w-full rounded-lg border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
                    >
                      {GALLERY_DISPLAY_CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <AdminInput
                  label="Alt Text"
                  value={item.alt || ""}
                  onChange={(e) => patch(item.id, { alt: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
