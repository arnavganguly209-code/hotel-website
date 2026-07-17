"use client";

import { useMemo, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Library, Loader2, Search, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/shared/SafeImage";
import { ImageCropDialog } from "@/components/admin/media/ImageCropDialog";
import {
  MEDIA_CATEGORIES,
  categoryFromFolder,
  folderFromCategory,
} from "@/lib/cms/media-categories";
import { isBundledPaymentUrl } from "@/lib/cms/payment-logos";
import type { MediaAsset } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

interface ImagePickerProps {
  value: string;
  onChange: (url: string, asset?: MediaAsset) => void;
  library: MediaAsset[];
  onLibraryChange: (library: MediaAsset[]) => void;
  label?: string;
  folder?: string;
  category?: string;
  className?: string;
  /** When true, never call onChange("") unless user confirms clear — used by payment slots. */
  keepValueOnFailedUpload?: boolean;
  onUploadError?: (message: string) => void;
  onUploadSuccess?: (url: string) => void;
  /**
   * Optional crop tool after a successful upload (never auto-opens on file select).
   * Original file always uploads first at full quality.
   */
  enableCrop?: boolean;
}

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/svg+xml,.svg";

export function ImagePicker({
  value,
  onChange,
  library,
  onLibraryChange,
  label = "Image",
  folder,
  category = "General",
  className,
  keepValueOnFailedUpload = true,
  onUploadError,
  onUploadSuccess,
  enableCrop = false,
}: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const previousValueRef = useRef(value);
  previousValueRef.current = value;

  const uploadFolder = folder || folderFromCategory(category);

  const items = useMemo(() => {
    let list = [...library];
    if (filter !== "All") {
      list = list.filter((i) => (i.category || categoryFromFolder(i.folder)) === filter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.filename.toLowerCase().includes(q) ||
          i.url.toLowerCase().includes(q)
      );
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [library, filter, query]);

  const fail = (message: string) => {
    console.error("[ImagePicker] Upload failed:", message);
    setError(message);
    setSuccess(null);
    onUploadError?.(message);
    if (keepValueOnFailedUpload && previousValueRef.current) {
      console.info("[ImagePicker] Keeping previous image:", previousValueRef.current);
    }
  };

  const handleUpload = async (file: File) => {
    console.info("[ImagePicker] Upload started", {
      name: file.name,
      type: file.type,
      size: file.size,
      folder: uploadFolder,
      previous: value || null,
    });

    setUploading(true);
    setError(null);
    setSuccess(null);
    const blobPreview = URL.createObjectURL(file);
    setPreview(blobPreview);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", uploadFolder);
    if (value && !isBundledPaymentUrl(value)) {
      formData.append("oldUrl", value);
    }

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      let data: {
        url?: string;
        urlWithBust?: string;
        error?: string;
        code?: string;
        verified?: boolean;
        diskVerified?: boolean;
        httpVerified?: boolean;
        httpStatus?: number;
        absolutePath?: string;
        root?: string;
      } = {};
      try {
        data = await res.json();
      } catch {
        fail("Upload failed — server returned an invalid response.");
        return;
      }

      if (!res.ok || !data.url || !data.diskVerified || !data.httpVerified) {
        const detail = data.error || `Upload failed (HTTP ${res.status}).`;
        fail(data.root ? `${detail} (storage: ${data.root})` : detail);
        return;
      }

      const nextUrl = data.urlWithBust || `${data.url}?v=${Date.now()}`;
      const cleanPath = data.url.split("?")[0];

      try {
        const probe = await fetch(`${cleanPath}?v=${Date.now()}`, {
          method: "GET",
          cache: "no-store",
        });
        if (!probe.ok) {
          fail(
            `Image not found after upload (HTTP ${probe.status}). Path: ${data.url}. Server claimed success but browser cannot load the file. Storage may be misconfigured.`
          );
          return;
        }
        const ctype = probe.headers.get("content-type") || "";
        if (ctype.includes("text/html")) {
          fail(
            `Upload URL returned HTML instead of an image (HTTP ${probe.status}). Path: ${data.url}. Not replacing previous image.`
          );
          return;
        }
      } catch (probeError) {
        console.error("[ImagePicker] Probe failed:", probeError);
        fail(
          "Image retrieval failed after upload. Previous image kept. Check filesystem / uploads permissions / Nginx."
        );
        return;
      }

      const asset: MediaAsset = {
        id: `m-${Date.now()}`,
        filename: data.url.split("/").pop() ?? file.name,
        url: nextUrl,
        publicId: data.url.replace(/^\/+/, ""),
        folder: uploadFolder,
        mimeType: file.type || "image/jpeg",
        size: file.size,
        createdAt: new Date().toISOString(),
        title: file.name.replace(/\.[^.]+$/, ""),
        alt: file.name.replace(/\.[^.]+$/, ""),
        category,
      };

      console.info("[ImagePicker] Upload completed", { url: nextUrl });

      onLibraryChange([
        asset,
        ...library.filter(
          (a) => a.url !== value && a.url.split("?")[0] !== data.url?.split("?")[0]
        ),
      ]);

      onChange(nextUrl, asset);
      onUploadSuccess?.(nextUrl);
      setSuccess("Image uploaded successfully.");
      setError(null);
      // Keep modal open briefly so user sees preview + success, then close
      setTimeout(() => {
        setOpen(false);
        setPreview(null);
      }, 900);
    } catch (err) {
      console.error("[ImagePicker] Stack:", err);
      fail(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      URL.revokeObjectURL(blobPreview);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-luxury-gold/70">{label}</p>
      <div className="flex flex-wrap items-start gap-3">
        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/30 p-2">
          {value ? (
            <SafeImage
              key={value}
              src={value}
              alt=""
              fill
              objectFit="contain"
              className="object-contain p-2"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/30">
              <ImagePlus className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() => {
              setTab("library");
              setSuccess(null);
              setError(null);
              setOpen(true);
            }}
          >
            <Library className="h-4 w-4" />
            Select Existing
          </Button>
          <Button
            type="button"
            size="sm"
            variant="gold"
            disabled={uploading}
            onClick={() => {
              setTab("upload");
              setSuccess(null);
              setError(null);
              setOpen(true);
            }}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload New"}
          </Button>
          {enableCrop && value && !value.toLowerCase().endsWith(".svg") ? (
            <button
              type="button"
              className="text-left text-xs text-luxury-gold/80 hover:underline"
              onClick={async () => {
                try {
                  const res = await fetch(value.split("?")[0], { cache: "no-store" });
                  if (!res.ok) throw new Error("Could not load image for optional crop");
                  const blob = await res.blob();
                  const name = value.split("/").pop()?.split("?")[0] || "image.jpg";
                  setCropFile(new File([blob], name, { type: blob.type || "image/jpeg" }));
                } catch (err) {
                  fail(err instanceof Error ? err.message : "Crop failed to start");
                }
              }}
            >
              Optional crop…
            </button>
          ) : null}
          {value ? (
            <button
              type="button"
              className="text-left text-xs text-red-400 hover:underline"
              onClick={() => onChange("")}
            >
              Clear image
            </button>
          ) : null}
        </div>
      </div>
      {value ? <p className="truncate text-[11px] text-white/40">{value}</p> : null}
      {success ? (
        <p className="flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-luxury-gold/20 bg-[#0f1c16] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={tab === "library" ? "gold" : "outline"}
                  className={tab !== "library" ? "border-luxury-gold/30 text-luxury-gold" : ""}
                  onClick={() => setTab("library")}
                >
                  Select Existing
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={tab === "upload" ? "gold" : "outline"}
                  className={tab !== "upload" ? "border-luxury-gold/30 text-luxury-gold" : ""}
                  onClick={() => setTab("upload")}
                >
                  Upload New
                </Button>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {tab === "library" ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <div className="relative min-w-[200px] flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search library…"
                        className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-10 pr-3 text-sm text-white"
                      />
                    </div>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                    >
                      <option value="All">All</option>
                      {MEDIA_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onChange(item.url, item);
                          onUploadSuccess?.(item.url);
                          setSuccess("Image selected successfully.");
                          setOpen(false);
                        }}
                        className={cn(
                          "overflow-hidden rounded-xl border text-left transition",
                          value === item.url
                            ? "border-luxury-gold"
                            : "border-white/10 hover:border-luxury-gold/50"
                        )}
                      >
                        <div className="relative flex aspect-square items-center justify-center bg-black/40 p-2">
                          <SafeImage
                            src={item.url}
                            alt={item.alt || item.title || ""}
                            fill
                            objectFit="contain"
                            className="object-contain p-1"
                          />
                        </div>
                        <p className="truncate p-2 text-[11px] text-white/70">
                          {item.title || item.filename}
                        </p>
                      </button>
                    ))}
                  </div>
                  {!items.length ? (
                    <p className="py-8 text-center text-sm text-white/40">
                      Library is empty. Upload a new image.
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt="Preview"
                      className="mx-auto max-h-56 rounded-xl object-contain"
                    />
                  ) : value ? (
                    <div className="relative mx-auto h-40 w-40">
                      <SafeImage src={value} alt="" fill objectFit="contain" />
                      <p className="mt-2 text-xs text-white/50">
                        Current image (kept until new upload succeeds)
                      </p>
                    </div>
                  ) : null}
                  <p className="text-sm text-white/60">
                    PNG, JPG, JPEG, WEBP, SVG · max 10MB · original quality preserved
                  </p>
                  <p className="text-xs text-white/40">
                    Images upload as-is — no automatic zoom or forced crop.
                  </p>
                  <Button
                    type="button"
                    variant="gold"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploading ? "Uploading…" : "Choose Image"}
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPT}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // Always upload the original file — never force crop on select
                      void handleUpload(file);
                    }}
                  />
                  {success ? (
                    <p className="flex items-center justify-center gap-2 text-sm text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      {success}
                    </p>
                  ) : null}
                  {error ? <p className="text-sm text-red-400">{error}</p> : null}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {cropFile ? (
        <ImageCropDialog
          file={cropFile}
          onCancel={() => {
            setCropFile(null);
            if (fileRef.current) fileRef.current.value = "";
          }}
          onConfirm={(cropped) => {
            setCropFile(null);
            void handleUpload(cropped);
          }}
        />
      ) : null}
    </div>
  );
}
