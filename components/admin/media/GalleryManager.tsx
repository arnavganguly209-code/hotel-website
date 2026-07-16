"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { AdminMediaField } from "@/components/admin/AdminMediaField";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import { SafeImage } from "@/components/shared/SafeImage";
import type { MediaAsset, SiteContent } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

type GalleryItem = SiteContent["gallery"][number];
type GalleryCategory = SiteContent["galleryCategories"][number];
type GallerySection = SiteContent["gallerySection"];
type GalleryPage = SiteContent["galleryPage"];

interface GalleryManagerProps {
  gallery: GalleryItem[];
  onChange: (gallery: GalleryItem[]) => void;
  categories: GalleryCategory[];
  onCategoriesChange: (categories: GalleryCategory[]) => void;
  section: GallerySection;
  onSectionChange: (section: GallerySection) => void;
  page: GalleryPage;
  onPageChange: (page: GalleryPage) => void;
  library: MediaAsset[];
  onLibraryChange: (library: MediaAsset[]) => void;
}

export function GalleryManager({
  gallery,
  onChange,
  categories,
  onCategoriesChange,
  section,
  onSectionChange,
  page,
  onPageChange,
  library,
  onLibraryChange,
}: GalleryManagerProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [catDragIndex, setCatDragIndex] = useState<number | null>(null);

  const sorted = [...gallery].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const sortedCats = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const categoryNames = sortedCats.filter((c) => c.enabled !== false).map((c) => c.name);

  const patch = (id: string, data: Partial<GalleryItem>) => {
    onChange(gallery.map((item) => (item.id === id ? { ...item, ...data } : item)));
  };

  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || to >= sorted.length) return;
    const next = [...sorted];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next.map((item, i) => ({ ...item, order: i })));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    reorder(index, index + direction);
  };

  const addItem = () => {
    const order = gallery.length ? Math.max(...gallery.map((g) => g.order ?? 0)) + 1 : 0;
    onChange([
      ...gallery,
      {
        id: `g-${Date.now()}`,
        src: "",
        title: "New Gallery Image",
        description: "",
        category: categoryNames[0] || "Rooms",
        type: "image",
        alt: "",
        active: true,
        showOnHome: false,
        order,
      },
    ]);
  };

  const reorderCats = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || to >= sortedCats.length) return;
    const next = [...sortedCats];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onCategoriesChange(next.map((item, i) => ({ ...item, order: i })));
  };

  const addCategory = () => {
    const order = categories.length
      ? Math.max(...categories.map((c) => c.order ?? 0)) + 1
      : 0;
    onCategoriesChange([
      ...categories,
      {
        id: `cat-${Date.now()}`,
        name: "New Category",
        enabled: true,
        order,
      },
    ]);
  };

  return (
    <div className="space-y-8">
      {/* Homepage section settings */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Homepage Gallery Section</p>
        <label className="flex items-center gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={section.enabled !== false}
            onChange={(e) => onSectionChange({ ...section, enabled: e.target.checked })}
            className="accent-luxury-gold"
          />
          Enable Section
        </label>
        <AdminInput
          label="Small Label"
          value={section.eyebrow}
          onChange={(e) => onSectionChange({ ...section, eyebrow: e.target.value })}
        />
        <AdminInput
          label="Main Heading"
          value={section.title}
          onChange={(e) => onSectionChange({ ...section, title: e.target.value })}
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={section.description}
          onChange={(e) => onSectionChange({ ...section, description: e.target.value })}
        />
        <label className="flex items-center gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={section.ctaVisible !== false}
            onChange={(e) => onSectionChange({ ...section, ctaVisible: e.target.checked })}
            className="accent-luxury-gold"
          />
          Show View Full Gallery Button
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            label="Button Text"
            value={section.ctaText}
            onChange={(e) => onSectionChange({ ...section, ctaText: e.target.value })}
          />
          <AdminInput
            label="Button URL"
            value={section.ctaHref}
            onChange={(e) => onSectionChange({ ...section, ctaHref: e.target.value })}
          />
          <AdminInput
            label="Home Image Limit"
            type="number"
            value={section.homeImageLimit}
            onChange={(e) =>
              onSectionChange({ ...section, homeImageLimit: Number(e.target.value) || 6 })
            }
          />
          <AdminInput
            label="Grid Gap (px)"
            type="number"
            value={section.gridGapPx}
            onChange={(e) =>
              onSectionChange({ ...section, gridGapPx: Number(e.target.value) || 20 })
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            label="Background Top"
            value={section.backgroundTop}
            onChange={(e) => onSectionChange({ ...section, backgroundTop: e.target.value })}
          />
          <AdminInput
            label="Background Bottom"
            value={section.backgroundBottom}
            onChange={(e) => onSectionChange({ ...section, backgroundBottom: e.target.value })}
          />
          <AdminInput
            label="Heading Color"
            value={section.headingColor}
            onChange={(e) => onSectionChange({ ...section, headingColor: e.target.value })}
          />
          <AdminInput
            label="Gold Accent"
            value={section.goldColor}
            onChange={(e) => onSectionChange({ ...section, goldColor: e.target.value })}
          />
          <AdminInput
            label="Border Color"
            value={section.borderColor}
            onChange={(e) => onSectionChange({ ...section, borderColor: e.target.value })}
          />
          <AdminInput
            label="Body Color"
            value={section.bodyColor}
            onChange={(e) => onSectionChange({ ...section, bodyColor: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={section.showMist !== false}
            onChange={(e) => onSectionChange({ ...section, showMist: e.target.checked })}
            className="accent-luxury-gold"
          />
          Show Mist / Mountain Silhouettes
        </label>
      </div>

      {/* Gallery page CMS */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Gallery Page</p>
        <AdminInput
          label="Page Hero Title"
          value={page.hero.title}
          onChange={(e) =>
            onPageChange({ ...page, hero: { ...page.hero, title: e.target.value } })
          }
        />
        <AdminInput
          label="Page Hero Subtitle"
          value={page.hero.subtitle}
          onChange={(e) =>
            onPageChange({ ...page, hero: { ...page.hero, subtitle: e.target.value } })
          }
        />
        <AdminTextarea
          label="Page Hero Description"
          rows={2}
          value={page.hero.description}
          onChange={(e) =>
            onPageChange({ ...page, hero: { ...page.hero, description: e.target.value } })
          }
        />
        <AdminMediaField
          label="Cover Image"
          folder="gallery"
          value={page.hero.media}
          onChange={(media) =>
            onPageChange({
              ...page,
              hero: {
                ...page.hero,
                media,
                imageSrc: media.imageSrc || page.hero.imageSrc,
              },
            })
          }
          library={library}
          onLibraryChange={onLibraryChange}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            label="SEO Title"
            value={page.seo.title}
            onChange={(e) =>
              onPageChange({ ...page, seo: { ...page.seo, title: e.target.value } })
            }
          />
          <AdminInput
            label="OG Image"
            value={page.seo.ogImage || ""}
            onChange={(e) =>
              onPageChange({ ...page, seo: { ...page.seo, ogImage: e.target.value } })
            }
          />
        </div>
        <AdminTextarea
          label="SEO Description"
          rows={2}
          value={page.seo.description}
          onChange={(e) =>
            onPageChange({ ...page, seo: { ...page.seo, description: e.target.value } })
          }
        />
        <AdminInput
          label="SEO Keywords"
          value={page.seo.keywords || ""}
          onChange={(e) =>
            onPageChange({ ...page, seo: { ...page.seo, keywords: e.target.value } })
          }
        />
        <label className="flex items-center gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={page.showFilters !== false}
            onChange={(e) => onPageChange({ ...page, showFilters: e.target.checked })}
            className="accent-luxury-gold"
          />
          Show Category Filters
        </label>
        <AdminInput
          label="Grid Columns (2–4)"
          type="number"
          value={page.gridColumns}
          onChange={(e) => {
            const n = Math.min(4, Math.max(2, Number(e.target.value) || 3)) as 2 | 3 | 4;
            onPageChange({ ...page, gridColumns: n });
          }}
        />
      </div>

      {/* Categories */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-lg text-luxury-gold">Gallery Categories</p>
          <Button type="button" variant="gold" size="sm" onClick={addCategory}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
        <p className="text-xs text-white/40">Drag to reorder · rename · enable / disable · delete</p>
        <div className="space-y-3">
          {sortedCats.map((cat, index) => (
            <div
              key={cat.id}
              draggable
              onDragStart={() => setCatDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (catDragIndex !== null) reorderCats(catDragIndex, index);
                setCatDragIndex(null);
              }}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-xl border border-luxury-gold/10 bg-black/20 p-3",
                catDragIndex === index && "opacity-60",
                cat.enabled === false && "opacity-50"
              )}
            >
              <GripVertical className="h-4 w-4 cursor-grab text-white/40" />
              <input
                value={cat.name}
                onChange={(e) => {
                  const next = categories.map((c) =>
                    c.id === cat.id ? { ...c, name: e.target.value } : c
                  );
                  onCategoriesChange(next);
                }}
                className="min-w-[160px] flex-1 rounded-lg border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
                placeholder="Category name"
              />
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={cat.enabled !== false}
                  onChange={(e) => {
                    onCategoriesChange(
                      categories.map((c) =>
                        c.id === cat.id ? { ...c, enabled: e.target.checked } : c
                      )
                    );
                  }}
                  className="accent-luxury-gold"
                />
                Enabled
              </label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-red-400"
                onClick={() => onCategoriesChange(categories.filter((c) => c.id !== cat.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/50">
            {gallery.length} gallery images · drag to reorder · move up / down
          </p>
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
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-white/50">
                  <GripVertical className="h-5 w-5 cursor-grab" />
                  <span className="text-xs uppercase tracking-wider">#{index + 1}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-luxury-gold/30 text-luxury-gold"
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
                    title="Move up / Bring forward"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-luxury-gold/30 text-luxury-gold"
                    disabled={index === sorted.length - 1}
                    onClick={() => moveItem(index, 1)}
                    title="Move down / Send backward"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <label className="flex items-center gap-2 text-xs text-white/60">
                    <input
                      type="checkbox"
                      checked={item.active !== false}
                      onChange={(e) => patch(item.id, { active: e.target.checked })}
                      className="rounded border-luxury-gold/40"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-xs text-white/60">
                    <input
                      type="checkbox"
                      checked={item.showOnHome !== false}
                      onChange={(e) => patch(item.id, { showOnHome: e.target.checked })}
                      className="rounded border-luxury-gold/40"
                    />
                    Show on Home
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
                    <SafeImage
                      src={item.src}
                      alt={item.alt || item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-white/30">
                      No image
                    </div>
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
                        {categoryNames.length === 0 ? (
                          <option value={item.category}>{item.category || "Uncategorized"}</option>
                        ) : (
                          categoryNames.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))
                        )}
                        {!categoryNames.includes(item.category) && item.category ? (
                          <option value={item.category}>{item.category}</option>
                        ) : null}
                      </select>
                    </div>
                  </div>
                  <AdminInput
                    label="Description"
                    value={item.description || ""}
                    onChange={(e) => patch(item.id, { description: e.target.value })}
                  />
                  <AdminInput
                    label="Alt Text (SEO)"
                    value={item.alt || ""}
                    onChange={(e) => patch(item.id, { alt: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
