"use client";

import { AdminInput } from "@/components/admin/AdminFields";
import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import { Trash2 } from "lucide-react";
import { deleteCmsMedia } from "@/lib/cms/client-media";
import type { CmsMedia, MediaAsset } from "@/lib/cms/types";

interface AdminMediaFieldProps {
  label: string;
  value: CmsMedia;
  onChange: (media: CmsMedia) => void;
  folder?: string;
  category?: string;
  library: MediaAsset[];
  onLibraryChange: (library: MediaAsset[]) => void;
}

export function AdminMediaField({
  label,
  value,
  onChange,
  folder = "uploads",
  category = "General",
  library,
  onLibraryChange,
}: AdminMediaFieldProps) {
  const set = (patch: Partial<CmsMedia>) => onChange({ ...value, ...patch });

  const handleRemove = async () => {
    if (value.type === "image" && (value.imagePublicId || value.imageSrc)) {
      await deleteCmsMedia({
        publicId: value.imagePublicId,
        url: value.imageSrc,
        resourceType: "image",
      });
    }
    onChange({
      ...value,
      imageSrc: "",
      imagePublicId: "",
      videoSrc: value.videoSrc,
      videoPublicId: value.videoPublicId,
      poster: "",
      posterPublicId: "",
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-luxury-gold/15 p-4">
      <p className="font-display text-sm text-luxury-gold">{label}</p>

      <div className="flex flex-wrap gap-2">
        {(["image", "video"] as const).map((type) => (
          <Button
            key={type}
            type="button"
            size="sm"
            variant={value.type === type ? "default" : "outline"}
            className={value.type === type ? "bg-luxury-gold text-white" : "border-luxury-gold/30 text-luxury-gold"}
            onClick={() => set({ type })}
          >
            {type === "image" ? "Image" : "Video"}
          </Button>
        ))}
      </div>

      {value.type === "image" ? (
        <ImagePicker
          label="Select or Upload Image"
          value={value.imageSrc}
          folder={folder}
          category={category}
          enableCrop
          library={library}
          onLibraryChange={onLibraryChange}
          onChange={(url, asset) =>
            set({
              imageSrc: url,
              imagePublicId: asset?.publicId ?? value.imagePublicId,
            })
          }
        />
      ) : (
        <>
          <AdminInput
            label="Video URL"
            value={value.videoSrc}
            onChange={(e) => set({ videoSrc: e.target.value })}
          />
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.2em] text-luxury-gold/70">
              Upload Video File
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
                form.append("folder", folder);
                if (value.videoSrc) form.append("oldUrl", value.videoSrc);
                const res = await fetch("/api/upload", { method: "POST", body: form });
                const data = await res.json().catch(() => ({}));
                if (res.ok && data.url) {
                  set({
                    videoSrc: data.url,
                    videoPublicId: data.publicId,
                    type: "video",
                  });
                  onLibraryChange([
                    {
                      id: data.publicId || data.url,
                      url: data.url,
                      publicId: data.publicId,
                      filename: file.name,
                      folder,
                      category,
                      title: file.name,
                      mimeType: file.type,
                      size: file.size,
                      createdAt: new Date().toISOString(),
                    },
                    ...library,
                  ]);
                }
                e.target.value = "";
              }}
            />
          </div>
          <p className="text-xs text-white/40">
            Upload an MP4/WEBM or paste a video URL. Add a poster image for the thumbnail.
          </p>
          <ImagePicker
            label="Poster Image"
            value={value.poster}
            folder={folder}
            category={category}
            enableCrop
            library={library}
            onLibraryChange={onLibraryChange}
            onChange={(url, asset) =>
              set({
                poster: url,
                posterPublicId: asset?.publicId ?? value.posterPublicId,
              })
            }
          />
        </>
      )}

      <AdminInput label="Alt Text" value={value.alt} onChange={(e) => set({ alt: e.target.value })} />
      <AdminInput
        label="Caption"
        value={value.caption ?? ""}
        onChange={(e) => set({ caption: e.target.value })}
      />

      {(value.imageSrc || value.videoSrc) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-red-300"
          onClick={() => void handleRemove()}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove Media
        </Button>
      )}
    </div>
  );
}
