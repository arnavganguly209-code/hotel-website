"use client";

import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  GripVertical,
  Plus,
  Trash2,
  Upload,
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
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const bulkRef = useRef<HTMLInputElement>(null);

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

  const addItem = (type: "image" | "video" = "image") => {
    const order = gallery.length ? Math.max(...gallery.map((g) => g.order ?? 0)) + 1 : 0;
    onChange([
      ...gallery,
      {
        id: `g-${Date.now()}`,
        src: "",
        title: type === "video" ? "New Gallery Video" : "New Gallery Image",
        description: "",
        category: categoryNames[0] || "Rooms",
        type,
        alt: "",
        poster: "",
        active: true,
        showOnHome: false,
        featured: false,
        order,
      },
    ]);
  };

  const duplicateItem = (item: GalleryItem) => {
    const order = gallery.length ? Math.max(...gallery.map((g) => g.order ?? 0)) + 1 : 0;
    onChange([
      ...gallery,
      {
        ...item,
        id: `g-${Date.now()}`,
        title: `${item.title} (Copy)`,
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
        icon: "image",
        order,
      },
    ]);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const bulkDelete = () => {
    if (!selected.length) return;
    onChange(gallery.filter((g) => !selected.includes(g.id)));
    setSelected([]);
  };

  const bulkSetCategory = (category: string) => {
    if (!selected.length || !category) return;
    onChange(
      gallery.map((g) => (selected.includes(g.id) ? { ...g, category } : g))
    );
  };

  const bulkUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBulkUploading(true);
    setBulkError(null);
    const orderBase = gallery.length ? Math.max(...gallery.map((g) => g.order ?? 0)) + 1 : 0;
    const added: GalleryItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const form = new FormData();
        form.append("file", file);
        form.append("folder", "gallery");
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `Upload failed for ${file.name}`);
        }
        const url = data.url as string;
        const isVideo = file.type.startsWith("video/");
        added.push({
          id: `g-${Date.now()}-${i}`,
          src: url,
          title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          description: "",
          category: categoryNames[0] || "Rooms",
          type: isVideo ? "video" : "image",
          alt: file.name,
          poster: "",
          active: true,
          showOnHome: false,
          featured: false,
          order: orderBase + i,
        });
        if (url) {
          onLibraryChange([
            {
              id: data.publicId || url,
              url,
              publicId: data.publicId,
              filename: file.name,
              folder: "gallery",
              category: "Gallery",
              title: file.name,
              mimeType: file.type || "application/octet-stream",
              size: file.size,
              createdAt: new Date().toISOString(),
            },
            ...library,
          ]);
        }
      }
      onChange([...gallery, ...added]);
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : "Bulk upload failed");
    } finally {
      setBulkUploading(false);
      if (bulkRef.current) bulkRef.current.value = "";
    }
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
        </div>
      </div>

      {/* Gallery page — cover + intro + SEO */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Gallery Page · Hero Cover</p>
        <AdminInput
          label="Hero Title"
          value={page.hero.title}
          onChange={(e) =>
            onPageChange({ ...page, hero: { ...page.hero, title: e.target.value } })
          }
        />
        <AdminInput
          label="Hero Subtitle"
          value={page.hero.subtitle}
          onChange={(e) =>
            onPageChange({ ...page, hero: { ...page.hero, subtitle: e.target.value } })
          }
        />
        <AdminTextarea
          label="Hero Description"
          rows={2}
          value={page.hero.description}
          onChange={(e) =>
            onPageChange({ ...page, hero: { ...page.hero, description: e.target.value } })
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            label="Breadcrumb Home"
            value={page.hero.breadcrumbHome || "Home"}
            onChange={(e) =>
              onPageChange({
                ...page,
                hero: { ...page.hero, breadcrumbHome: e.target.value },
              })
            }
          />
          <AdminInput
            label="Breadcrumb Current"
            value={page.hero.breadcrumbCurrent || "Gallery"}
            onChange={(e) =>
              onPageChange({
                ...page,
                hero: { ...page.hero, breadcrumbCurrent: e.target.value },
              })
            }
          />
          <AdminInput
            label="Overlay Opacity (0.35–0.65)"
            type="number"
            step="0.01"
            value={page.hero.overlayOpacity ?? 0.45}
            onChange={(e) =>
              onPageChange({
                ...page,
                hero: {
                  ...page.hero,
                  overlayOpacity: Math.min(0.65, Math.max(0.35, Number(e.target.value) || 0.45)),
                },
              })
            }
          />
        </div>
        <AdminMediaField
          label="Cover Image / Video"
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
      </div>

      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Introduction & Grid</p>
        <AdminInput
          label="Intro Eyebrow"
          value={page.eyebrow}
          onChange={(e) => onPageChange({ ...page, eyebrow: e.target.value })}
        />
        <AdminInput
          label="Intro Title"
          value={page.title}
          onChange={(e) => onPageChange({ ...page, title: e.target.value })}
        />
        <AdminTextarea
          label="Intro Description"
          rows={3}
          value={page.description}
          onChange={(e) => onPageChange({ ...page, description: e.target.value })}
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
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminInput
            label="Grid Columns (2–4)"
            type="number"
            value={page.gridColumns}
            onChange={(e) => {
              const n = Math.min(4, Math.max(2, Number(e.target.value) || 4)) as 2 | 3 | 4;
              onPageChange({ ...page, gridColumns: n });
            }}
          />
          <AdminInput
            label="Initial Visible"
            type="number"
            value={page.initialVisible ?? 8}
            onChange={(e) =>
              onPageChange({ ...page, initialVisible: Number(e.target.value) || 8 })
            }
          />
          <AdminInput
            label="Load More Count"
            type="number"
            value={page.loadMoreCount ?? 8}
            onChange={(e) =>
              onPageChange({ ...page, loadMoreCount: Number(e.target.value) || 8 })
            }
          />
        </div>
      </div>

      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Featured · Videos · Strip · CTA</p>
        <label className="flex items-center gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={page.featured.enabled !== false}
            onChange={(e) =>
              onPageChange({
                ...page,
                featured: { ...page.featured, enabled: e.target.checked },
              })
            }
            className="accent-luxury-gold"
          />
          Enable Featured Collection
        </label>
        <AdminInput
          label="Featured Eyebrow"
          value={page.featured.eyebrow}
          onChange={(e) =>
            onPageChange({
              ...page,
              featured: { ...page.featured, eyebrow: e.target.value },
            })
          }
        />
        <AdminInput
          label="Featured Title"
          value={page.featured.title}
          onChange={(e) =>
            onPageChange({
              ...page,
              featured: { ...page.featured, title: e.target.value },
            })
          }
        />
        <AdminTextarea
          label="Featured Description"
          rows={2}
          value={page.featured.description}
          onChange={(e) =>
            onPageChange({
              ...page,
              featured: { ...page.featured, description: e.target.value },
            })
          }
        />

        <label className="flex items-center gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={page.videos.enabled !== false}
            onChange={(e) =>
              onPageChange({
                ...page,
                videos: { ...page.videos, enabled: e.target.checked },
              })
            }
            className="accent-luxury-gold"
          />
          Enable Video Gallery
        </label>
        <AdminInput
          label="Videos Eyebrow"
          value={page.videos.eyebrow}
          onChange={(e) =>
            onPageChange({
              ...page,
              videos: { ...page.videos, eyebrow: e.target.value },
            })
          }
        />
        <AdminInput
          label="Videos Title"
          value={page.videos.title}
          onChange={(e) =>
            onPageChange({
              ...page,
              videos: { ...page.videos, title: e.target.value },
            })
          }
        />
        <AdminTextarea
          label="Videos Description"
          rows={2}
          value={page.videos.description}
          onChange={(e) =>
            onPageChange({
              ...page,
              videos: { ...page.videos, description: e.target.value },
            })
          }
        />

        <label className="flex items-center gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={page.strip.enabled !== false}
            onChange={(e) =>
              onPageChange({
                ...page,
                strip: { ...page.strip, enabled: e.target.checked },
              })
            }
            className="accent-luxury-gold"
          />
          Enable Instagram Strip
        </label>
        <AdminInput
          label="Strip Title"
          value={page.strip.title}
          onChange={(e) =>
            onPageChange({
              ...page,
              strip: { ...page.strip, title: e.target.value },
            })
          }
        />

        <AdminInput
          label="CTA Title"
          value={page.cta.title}
          onChange={(e) =>
            onPageChange({ ...page, cta: { ...page.cta, title: e.target.value } })
          }
        />
        <AdminTextarea
          label="CTA Description"
          rows={2}
          value={page.cta.description}
          onChange={(e) =>
            onPageChange({ ...page, cta: { ...page.cta, description: e.target.value } })
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            label="Primary Button Text"
            value={page.cta.primaryText}
            onChange={(e) =>
              onPageChange({ ...page, cta: { ...page.cta, primaryText: e.target.value } })
            }
          />
          <AdminInput
            label="Primary Button URL"
            value={page.cta.primaryHref}
            onChange={(e) =>
              onPageChange({ ...page, cta: { ...page.cta, primaryHref: e.target.value } })
            }
          />
          <AdminInput
            label="Secondary Button Text"
            value={page.cta.secondaryText}
            onChange={(e) =>
              onPageChange({ ...page, cta: { ...page.cta, secondaryText: e.target.value } })
            }
          />
          <AdminInput
            label="Secondary Button URL"
            value={page.cta.secondaryHref}
            onChange={(e) =>
              onPageChange({ ...page, cta: { ...page.cta, secondaryHref: e.target.value } })
            }
          />
        </div>
        <ImagePicker
          label="CTA Background Image"
          value={page.cta.backgroundImage}
          category="Gallery"
          folder="gallery"
          enableCrop
          library={library}
          onLibraryChange={onLibraryChange}
          onChange={(url) =>
            onPageChange({ ...page, cta: { ...page.cta, backgroundImage: url } })
          }
        />
      </div>

      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">SEO</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            label="SEO Title"
            value={page.seo.title}
            onChange={(e) =>
              onPageChange({ ...page, seo: { ...page.seo, title: e.target.value } })
            }
          />
          <AdminInput
            label="Canonical URL"
            value={page.seo.canonical || ""}
            onChange={(e) =>
              onPageChange({ ...page, seo: { ...page.seo, canonical: e.target.value } })
            }
          />
          <AdminInput
            label="OG Image"
            value={page.seo.ogImage || ""}
            onChange={(e) =>
              onPageChange({ ...page, seo: { ...page.seo, ogImage: e.target.value } })
            }
          />
          <AdminInput
            label="Keywords"
            value={page.seo.keywords || ""}
            onChange={(e) =>
              onPageChange({ ...page, seo: { ...page.seo, keywords: e.target.value } })
            }
          />
        </div>
        <AdminTextarea
          label="Meta Description"
          rows={2}
          value={page.seo.description}
          onChange={(e) =>
            onPageChange({ ...page, seo: { ...page.seo, description: e.target.value } })
          }
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
        <p className="text-xs text-white/40">
          Drag to reorder · rename · icon · enable / disable · delete · unlimited
        </p>
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
                  onCategoriesChange(
                    categories.map((c) =>
                      c.id === cat.id ? { ...c, name: e.target.value } : c
                    )
                  );
                }}
                className="min-w-[140px] flex-1 rounded-lg border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
                placeholder="Category name"
              />
              <input
                value={cat.icon || ""}
                onChange={(e) => {
                  onCategoriesChange(
                    categories.map((c) =>
                      c.id === cat.id ? { ...c, icon: e.target.value } : c
                    )
                  );
                }}
                className="w-28 rounded-lg border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
                placeholder="Icon"
                title="Icon name / emoji"
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
                Show
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

      {/* Images & videos */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-white/50">
            {gallery.length} media items · drag to reorder · bulk actions
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={bulkRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              multiple
              className="hidden"
              onChange={(e) => bulkUpload(e.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-luxury-gold/30 text-luxury-gold"
              disabled={bulkUploading}
              onClick={() => bulkRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {bulkUploading ? "Uploading…" : "Bulk Upload"}
            </Button>
            <Button type="button" variant="gold" size="sm" onClick={() => addItem("image")}>
              <Plus className="h-4 w-4" />
              Add Image
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => addItem("video")}>
              <Plus className="h-4 w-4" />
              Add Video
            </Button>
          </div>
        </div>

        {bulkError ? <p className="text-sm text-red-400">{bulkError}</p> : null}

        {selected.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-luxury-gold/20 bg-black/30 p-3">
            <span className="text-xs text-white/60">{selected.length} selected</span>
            <select
              className="rounded-lg border border-luxury-gold/20 bg-black/40 px-3 py-1.5 text-xs text-white"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) bulkSetCategory(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Change category…</option>
              {categoryNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Button type="button" size="sm" variant="ghost" className="text-red-400" onClick={bulkDelete}>
              <Trash2 className="h-4 w-4" />
              Bulk Delete
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setSelected([])}>
              Clear
            </Button>
          </div>
        ) : null}

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
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="accent-luxury-gold"
                    aria-label="Select item"
                  />
                  <GripVertical className="h-5 w-5 cursor-grab" />
                  <span className="text-xs uppercase tracking-wider">
                    #{index + 1} · {item.type === "video" ? "Video" : "Image"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-luxury-gold/30 text-luxury-gold"
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
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
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => duplicateItem(item)}
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <label className="flex items-center gap-2 text-xs text-white/60">
                    <input
                      type="checkbox"
                      checked={item.active !== false}
                      onChange={(e) => patch(item.id, { active: e.target.checked })}
                      className="rounded border-luxury-gold/40"
                    />
                    Show
                  </label>
                  <label className="flex items-center gap-2 text-xs text-white/60">
                    <input
                      type="checkbox"
                      checked={item.featured === true}
                      onChange={(e) => patch(item.id, { featured: e.target.checked })}
                      className="rounded border-luxury-gold/40"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-xs text-white/60">
                    <input
                      type="checkbox"
                      checked={item.showOnHome !== false}
                      onChange={(e) => patch(item.id, { showOnHome: e.target.checked })}
                      className="rounded border-luxury-gold/40"
                    />
                    Home
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
                  {item.type === "video" && item.src ? (
                    <video
                      src={item.src}
                      poster={item.poster || undefined}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  ) : item.src || item.poster ? (
                    <SafeImage
                      src={item.poster || item.src}
                      alt={item.alt || item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-white/30">
                      No media
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 text-xs text-white/60">
                      Type
                      <select
                        value={item.type || "image"}
                        onChange={(e) =>
                          patch(item.id, { type: e.target.value as "image" | "video" })
                        }
                        className="rounded-lg border border-luxury-gold/20 bg-black/30 px-2 py-1 text-sm text-white"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </label>
                  </div>

                  {item.type === "video" ? (
                    <>
                      <AdminInput
                        label="Video URL (upload path or external)"
                        value={item.src}
                        onChange={(e) => patch(item.id, { src: e.target.value })}
                      />
                      <div>
                        <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.2em] text-luxury-gold/70">
                          Upload Video File (MP4 / WEBM)
                        </label>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          className="block w-full text-xs text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-luxury-gold/20 file:px-3 file:py-2 file:text-luxury-gold"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const form = new FormData();
                            form.append("file", file);
                            form.append("folder", "gallery");
                            if (item.src) form.append("oldUrl", item.src);
                            const res = await fetch("/api/upload", { method: "POST", body: form });
                            const data = await res.json().catch(() => ({}));
                            if (res.ok && data.url) {
                              patch(item.id, { src: data.url, type: "video" });
                              onLibraryChange([
                                {
                                  id: data.publicId || data.url,
                                  url: data.url,
                                  publicId: data.publicId,
                                  filename: file.name,
                                  folder: "gallery",
                                  category: "Gallery",
                                  title: file.name,
                                  mimeType: file.type,
                                  size: file.size,
                                  createdAt: new Date().toISOString(),
                                },
                                ...library,
                              ]);
                            } else {
                              setBulkError(data.error || "Video upload failed");
                            }
                            e.target.value = "";
                          }}
                        />
                      </div>
                      <ImagePicker
                        label="Video Thumbnail / Poster"
                        value={item.poster || ""}
                        category="Gallery"
                        folder="gallery"
                        enableCrop
                        library={library}
                        onLibraryChange={onLibraryChange}
                        onChange={(url) => patch(item.id, { poster: url })}
                      />
                    </>
                  ) : (
                    <ImagePicker
                      label="Gallery Image"
                      value={item.src}
                      category="Gallery"
                      folder="gallery"
                      enableCrop
                      library={library}
                      onLibraryChange={onLibraryChange}
                      onChange={(url) => patch(item.id, { src: url })}
                    />
                  )}

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
