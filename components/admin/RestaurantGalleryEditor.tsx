"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import type { SiteContent } from "@/lib/cms/types";

type GalleryItem = SiteContent["diningPage"]["gallery"][number];

interface RestaurantGalleryEditorProps {
  content: SiteContent;
  update: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void;
}

const SLOT_COUNT = 3;

const SLOT_DEFAULTS: Array<Pick<GalleryItem, "id" | "title" | "alt">> = [
  { id: "d1", title: "Garden Restaurant", alt: "Garden View Korean Restaurant" },
  { id: "d2", title: "Sky Lounge", alt: "Sky Lounge Restaurant and Bar" },
  { id: "d3", title: "Lobby Moments", alt: "Lobby cafe dining ambience" },
];

function ensureThreeSlots(gallery: GalleryItem[]): GalleryItem[] {
  const source = Array.isArray(gallery) ? [...gallery] : [];
  const slots: GalleryItem[] = [];

  for (let i = 0; i < SLOT_COUNT; i++) {
    const existing = source[i];
    const fallback = SLOT_DEFAULTS[i];
    slots.push({
      id: existing?.id || fallback.id,
      src: existing?.src || "",
      title: existing?.title || fallback.title,
      alt: existing?.alt || fallback.alt,
      enabled: existing?.enabled !== false,
      order: i,
    });
  }

  return slots;
}

/**
 * Atmosphere / Restaurant Gallery on /dining — always 3 boxes with
 * upload, replace, and delete in Orbit (Fine Dining + Dining Page).
 */
export function RestaurantGalleryEditor({ content, update }: RestaurantGalleryEditorProps) {
  const page = content.diningPage;
  const section = page.gallerySection ?? {
    eyebrow: "Atmosphere",
    title: "Restaurant Gallery",
    description: "",
  };
  const gallery = ensureThreeSlots(page.gallery);

  const setPage = (next: SiteContent["diningPage"]) => update("diningPage", next);

  const setGallery = (next: GalleryItem[]) =>
    setPage({
      ...page,
      gallery: ensureThreeSlots(next),
    });

  const patchItem = (index: number, patch: Partial<GalleryItem>) => {
    const next = [...gallery];
    next[index] = { ...next[index], ...patch };
    setGallery(next);
  };

  const clearImage = (index: number) => {
    patchItem(index, { src: "" });
  };

  return (
    <div
      id="orbit-restaurant-gallery"
      className="space-y-4 border border-luxury-gold/30 bg-luxury-gold/[0.04] p-6"
    >
      <div>
        <p className="font-display text-lg text-luxury-gold">
          Atmosphere — Restaurant Gallery
        </p>
        <p className="mt-1 text-xs text-white/55">
          These 3 boxes appear at the bottom of /dining under Atmosphere / Restaurant Gallery.
          Upload, replace, or delete each photo. Changes auto-save and show on the live page.
        </p>
      </div>

      <AdminInput
        label="Small label (eyebrow)"
        value={section.eyebrow || ""}
        onChange={(e) =>
          setPage({ ...page, gallerySection: { ...section, eyebrow: e.target.value } })
        }
      />
      <AdminInput
        label="Title"
        value={section.title || ""}
        onChange={(e) =>
          setPage({ ...page, gallerySection: { ...section, title: e.target.value } })
        }
      />
      <AdminTextarea
        label="Description"
        rows={2}
        value={section.description || ""}
        onChange={(e) =>
          setPage({ ...page, gallerySection: { ...section, description: e.target.value } })
        }
      />

      <p className="text-sm text-white/70">
        Gallery boxes ({gallery.filter((item) => Boolean(item.src?.trim())).length} of {SLOT_COUNT}{" "}
        filled)
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        {gallery.map((item, i) => (
          <div
            key={item.id || `slot-${i}`}
            className="space-y-3 border border-luxury-gold/20 bg-black/25 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-luxury-gold">Box {i + 1}</p>
                <p className="text-[11px] text-white/45">
                  {item.src?.trim() ? "Image set — replace or delete" : "Empty — upload an image"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 text-red-400"
                disabled={!item.src?.trim()}
                onClick={() => clearImage(i)}
                title="Delete image from this box"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div
              className="relative aspect-[4/5] overflow-hidden rounded-xl border border-luxury-gold/25 bg-[#0f1f18]/60"
              aria-hidden={!item.src?.trim()}
            >
              {item.src?.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.src}
                  alt={item.alt || item.title || `Gallery box ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-3 text-center text-[11px] text-white/35">
                  Box {i + 1} — no image yet
                </div>
              )}
            </div>

            <ImagePicker
              label={`Box ${i + 1} — upload or replace`}
              folder="dining"
              category="Dining"
              value={item.src || ""}
              library={content.mediaLibrary}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              enableCrop
              onChange={(url) =>
                patchItem(i, {
                  src: url,
                  alt: item.alt || item.title || `Restaurant gallery ${i + 1}`,
                })
              }
            />
            <AdminInput
              label="Caption / title"
              value={item.title || ""}
              onChange={(e) => patchItem(i, { title: e.target.value })}
            />
            <AdminInput
              label="Image alt text"
              value={item.alt || ""}
              onChange={(e) => patchItem(i, { alt: e.target.value })}
            />
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={item.enabled !== false}
                className="accent-luxury-gold"
                onChange={(e) => patchItem(i, { enabled: e.target.checked })}
              />
              Show on /dining
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
