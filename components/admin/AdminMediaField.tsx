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
          <p className="text-xs text-white/40">
            Paste a video URL. Upload a poster image below for the thumbnail.
          </p>
          <ImagePicker
            label="Poster Image"
            value={value.poster}
            folder={folder}
            category={category}
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
