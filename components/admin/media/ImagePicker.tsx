"use client";

import { useMemo, useRef, useState } from "react";
import { ImagePlus, Library, Loader2, Search, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/shared/SafeImage";
import {
  MEDIA_CATEGORIES,
  categoryFromFolder,
  folderFromCategory,
} from "@/lib/cms/media-categories";
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
}

export function ImagePicker({
  value,
  onChange,
  library,
  onLibraryChange,
  label = "Image",
  folder,
  category = "General",
  className,
}: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", uploadFolder);
    if (value) formData.append("oldUrl", value);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Upload failed");
        return;
      }
      const asset: MediaAsset = {
        id: `m-${Date.now()}`,
        filename: data.url.split("/").pop() ?? file.name,
        url: data.url,
        publicId: data.public_id,
        folder: uploadFolder,
        mimeType: file.type || "image/jpeg",
        size: file.size,
        createdAt: new Date().toISOString(),
        title: file.name.replace(/\.[^.]+$/, ""),
        alt: file.name.replace(/\.[^.]+$/, ""),
        category,
      };
      onLibraryChange([asset, ...library.filter((a) => a.url !== value)]);
      onChange(data.url, asset);
      setOpen(false);
      setPreview(null);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-luxury-gold/70">{label}</p>
      <div className="flex flex-wrap items-start gap-3">
        <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-white/10 bg-black/30">
          {value ? (
            <SafeImage src={value} alt="" fill className="object-cover" />
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
            onClick={() => {
              setTab("upload");
              setOpen(true);
            }}
          >
            <Upload className="h-4 w-4" />
            Upload New
          </Button>
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
              <button type="button" onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
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
                          setOpen(false);
                        }}
                        className={cn(
                          "overflow-hidden rounded-xl border text-left transition",
                          value === item.url ? "border-luxury-gold" : "border-white/10 hover:border-luxury-gold/50"
                        )}
                      >
                        <div className="relative aspect-square bg-black/40">
                          <SafeImage src={item.url} alt={item.alt || item.title || ""} fill className="object-cover" />
                        </div>
                        <p className="truncate p-2 text-[11px] text-white/70">{item.title || item.filename}</p>
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
                    <img src={preview} alt="Preview" className="mx-auto max-h-56 rounded-xl object-contain" />
                  ) : null}
                  <p className="text-sm text-white/60">JPG, PNG or WEBP · max 10MB</p>
                  <Button
                    type="button"
                    variant="gold"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading…" : "Choose Image"}
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleUpload(file);
                    }}
                  />
                  {error ? <p className="text-sm text-red-400">{error}</p> : null}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
