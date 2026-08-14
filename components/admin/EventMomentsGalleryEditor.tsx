"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import type { SiteContent } from "@/lib/cms/types";

interface EventMomentsGalleryEditorProps {
  content: SiteContent;
  update: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void;
}

export function EventMomentsGalleryEditor({ content, update }: EventMomentsGalleryEditorProps) {
  const page = content.meetingsEventsPage;
  const gallery = Array.isArray(page.gallery) ? page.gallery : [];
  const section = page.gallerySection ?? {
    eyebrow: "Gallery",
    title: "Event Moments",
    description: "",
  };

  const setPage = (next: SiteContent["meetingsEventsPage"]) => update("meetingsEventsPage", next);

  const setGallery = (next: typeof gallery) =>
    setPage({
      ...page,
      gallery: next.map((item, order) => ({ ...item, order })),
    });

  const patchItem = (index: number, patch: Partial<(typeof gallery)[number]>) => {
    const next = [...gallery];
    next[index] = { ...next[index], ...patch };
    setGallery(next);
  };

  return (
    <div
      id="orbit-event-moments"
      className="space-y-4 border border-luxury-gold/30 bg-luxury-gold/[0.04] p-6"
    >
      <div>
        <p className="font-display text-lg text-luxury-gold">Gallery — Event Moments</p>
        <p className="mt-1 text-xs text-white/55">
          This is the Event Moments grid on /meetings-events. Upload, replace, or remove any photo.
          Changes auto-save and show on the live page.
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
        label="Description (optional)"
        rows={2}
        value={section.description || ""}
        onChange={(e) =>
          setPage({ ...page, gallerySection: { ...section, description: e.target.value } })
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/70">
          Photos ({gallery.filter((item) => item.enabled !== false).length} visible / {gallery.length})
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-luxury-gold/30 text-luxury-gold"
          onClick={() =>
            setGallery([
              ...gallery,
              {
                id: `g-${Date.now()}`,
                enabled: true,
                order: gallery.length,
                src: "",
                title: "New Photo",
                alt: "",
              },
            ])
          }
        >
          <Plus className="h-4 w-4" /> Add Image
        </Button>
      </div>
      {gallery.length === 0 ? (
        <p className="text-xs text-white/45">No gallery photos yet. Click Add Image.</p>
      ) : null}
      {gallery.map((item, i) => (
        <div key={item.id || `g-${i}`} className="space-y-3 border border-luxury-gold/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-luxury-gold">
              Image {i + 1}
              {item.title ? ` — ${item.title}` : ""}
            </p>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={item.enabled !== false}
                  className="accent-luxury-gold"
                  onChange={(e) => patchItem(i, { enabled: e.target.checked })}
                />
                Show on page
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400"
                onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ImagePicker
            label="Photo — upload or replace"
            folder="events"
            category="Events"
            value={item.src || ""}
            library={content.mediaLibrary}
            onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
            enableCrop
            onChange={(url) => patchItem(i, { src: url, alt: item.alt || item.title })}
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
        </div>
      ))}
    </div>
  );
}
