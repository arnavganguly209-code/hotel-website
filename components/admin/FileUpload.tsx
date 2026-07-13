"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UploadResult } from "@/lib/cms/client-media";
import { publicIdFromCloudinaryUrl } from "@/lib/cms/media-utils";

interface FileUploadProps {
  value: string;
  onChange: (url: string, result?: UploadResult) => void;
  folder?: string;
  label?: string;
  accept?: string;
  className?: string;
  /** Cloudinary public_id of the asset being replaced (deleted after successful upload). */
  replacePublicId?: string;
}

export function FileUpload({
  value,
  onChange,
  folder = "uploads",
  label = "Upload File",
  accept = "image/*,video/*",
  className,
  replacePublicId,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const oldId = replacePublicId || publicIdFromCloudinaryUrl(value) || "";
    if (oldId) {
      formData.append("oldPublicId", oldId);
    }

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? data.message ?? "Upload failed");
        if (data.debug) {
          console.warn("[FileUpload] Upload error debug:", data.debug);
        }
        return;
      }
      const result: UploadResult = {
        url: data.url,
        publicId: data.public_id,
        resourceType: data.resource_type,
      };
      onChange(data.url, result);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold/10"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {label}
        </Button>
      </div>
      {value && <p className="truncate text-xs text-white/40">{value}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
