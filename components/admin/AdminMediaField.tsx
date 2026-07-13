"use client";

import { FileUpload } from "@/components/admin/FileUpload";
import { AdminInput } from "@/components/admin/AdminFields";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteCmsMedia } from "@/lib/cms/client-media";
import type { CmsMedia } from "@/lib/cms/types";

interface AdminMediaFieldProps {
  label: string;
  value: CmsMedia;
  onChange: (media: CmsMedia) => void;
  folder?: string;
}

export function AdminMediaField({ label, value, onChange, folder = "uploads" }: AdminMediaFieldProps) {
  const set = (patch: Partial<CmsMedia>) => onChange({ ...value, ...patch });

  const handleRemove = async () => {
    if (value.type === "image" && (value.imagePublicId || value.imageSrc)) {
      await deleteCmsMedia({
        publicId: value.imagePublicId,
        url: value.imageSrc,
        resourceType: "image",
      });
    }
    if (value.type === "video" && (value.videoPublicId || value.videoSrc)) {
      await deleteCmsMedia({
        publicId: value.videoPublicId,
        url: value.videoSrc,
        resourceType: "video",
      });
    }
    onChange({
      ...value,
      imageSrc: "",
      imagePublicId: "",
      videoSrc: "",
      videoPublicId: "",
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
        <>
          <AdminInput
            label="Image URL"
            value={value.imageSrc}
            onChange={(e) => set({ imageSrc: e.target.value })}
          />
          <FileUpload
            label="Upload Image"
            folder={folder}
            accept="image/*"
            value={value.imageSrc}
            replacePublicId={value.imagePublicId}
            onChange={(url, result) =>
              set({
                imageSrc: url,
                imagePublicId: result?.publicId ?? value.imagePublicId,
              })
            }
          />
        </>
      ) : (
        <>
          <AdminInput
            label="Video URL"
            value={value.videoSrc}
            onChange={(e) => set({ videoSrc: e.target.value })}
          />
          <FileUpload
            label="Upload Video"
            folder={folder}
            accept="video/*"
            value={value.videoSrc}
            replacePublicId={value.videoPublicId}
            onChange={(url, result) =>
              set({
                videoSrc: url,
                videoPublicId: result?.publicId ?? value.videoPublicId,
              })
            }
          />
          <AdminInput
            label="Poster URL"
            value={value.poster}
            onChange={(e) => set({ poster: e.target.value })}
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
        <div className="space-y-2">
          {value.type === "image" && value.imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.imageSrc} alt={value.alt || "Preview"} className="max-h-40 rounded border border-white/10 object-cover" />
          ) : value.videoSrc ? (
            <video src={value.videoSrc} controls className="max-h-40 w-full rounded border border-white/10" />
          ) : null}
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
        </div>
      )}
    </div>
  );
}
