"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Copy,
  Grid3X3,
  List,
  Loader2,
  Replace,
  Search,
  Trash2,
  Upload,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/AdminFields";
import { SafeImage } from "@/components/shared/SafeImage";
import { deleteCmsMedia } from "@/lib/cms/client-media";
import {
  MEDIA_CATEGORIES,
  categoryFromFolder,
  folderFromCategory,
} from "@/lib/cms/media-categories";
import type { MediaAsset } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

type SortMode = "newest" | "oldest" | "name";
type ViewMode = "grid" | "list";

interface MediaLibraryProps {
  library: MediaAsset[];
  onChange: (library: MediaAsset[]) => void;
}

interface UploadProgress {
  name: string;
  percent: number;
  preview?: string;
  error?: string;
}

async function uploadFile(
  file: File,
  folder: string,
  onProgress: (percent: number) => void
): Promise<{ url: string; publicId: string; size: number; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.url) {
          resolve({
            url: data.url,
            publicId: data.public_id ?? data.url.replace(/^\//, ""),
            size: file.size,
            mimeType: file.type || "image/jpeg",
          });
        } else {
          reject(new Error(data.error || "Upload failed"));
        }
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  });
}

export function MediaLibrary({ library, onChange }: MediaLibraryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortMode>("newest");
  const [view, setView] = useState<ViewMode>("grid");
  const [uploadCategory, setUploadCategory] = useState<string>("General");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    let items = [...library];
    if (category !== "All") {
      items = items.filter((i) => (i.category || categoryFromFolder(i.folder)) === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.filename.toLowerCase().includes(q) ||
          i.alt?.toLowerCase().includes(q) ||
          i.url.toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => {
      if (sort === "name") return (a.title || a.filename).localeCompare(b.title || b.filename);
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return items;
  }, [library, category, query, sort]);

  const selected = library.find((i) => i.id === selectedId) ?? null;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) =>
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(f.type)
      );
      if (!list.length) return;

      setBusy(true);
      const folder = folderFromCategory(uploadCategory);
      const nextProgress: UploadProgress[] = list.map((f) => ({
        name: f.name,
        percent: 0,
        preview: URL.createObjectURL(f),
      }));
      setProgress(nextProgress);

      const uploaded: MediaAsset[] = [];
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        try {
          const result = await uploadFile(file, folder, (percent) => {
            setProgress((prev) => prev.map((p, idx) => (idx === i ? { ...p, percent } : p)));
          });
          uploaded.push({
            id: `m-${Date.now()}-${i}`,
            filename: result.url.split("/").pop() ?? file.name,
            url: result.url,
            publicId: result.publicId,
            folder,
            mimeType: result.mimeType,
            size: result.size,
            createdAt: new Date().toISOString(),
            title: file.name.replace(/\.[^.]+$/, ""),
            alt: file.name.replace(/\.[^.]+$/, ""),
            category: uploadCategory,
          });
          setProgress((prev) => prev.map((p, idx) => (idx === i ? { ...p, percent: 100 } : p)));
        } catch (err) {
          setProgress((prev) =>
            prev.map((p, idx) =>
              idx === i ? { ...p, error: err instanceof Error ? err.message : "Failed" } : p
            )
          );
        }
      }

      if (uploaded.length) onChange([...uploaded, ...library]);
      setBusy(false);
      setTimeout(() => setProgress([]), 1200);
      if (inputRef.current) inputRef.current.value = "";
    },
    [library, onChange, uploadCategory]
  );

  const patchAsset = (id: string, patch: Partial<MediaAsset>) => {
    onChange(library.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeAsset = async (item: MediaAsset) => {
    await deleteCmsMedia({ url: item.url, publicId: item.publicId });
    onChange(library.filter((a) => a.id !== item.id));
    if (selectedId === item.id) setSelectedId(null);
  };

  const replaceAsset = async (item: MediaAsset, file: File) => {
    setBusy(true);
    try {
      const folder = item.folder || folderFromCategory(item.category || "General");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("oldUrl", item.url);
      if (item.publicId) formData.append("oldPublicId", item.publicId);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Replace failed");
      patchAsset(item.id, {
        url: data.url,
        publicId: data.public_id,
        filename: data.url.split("/").pop() ?? file.name,
        size: file.size,
        mimeType: file.type || "image/jpeg",
        createdAt: new Date().toISOString(),
      });
    } finally {
      setBusy(false);
    }
  };

  const copyUrl = async (item: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          dragOver ? "border-luxury-gold bg-luxury-gold/10" : "border-luxury-gold/25 bg-white/5"
        )}
      >
        <Upload className="mx-auto mb-3 h-8 w-8 text-luxury-gold" />
        <p className="font-display text-lg text-white">Drag & drop images here</p>
        <p className="mt-1 text-sm text-white/50">JPG, PNG, WEBP · max 10MB each · multiple files OK</p>
        <div className="mx-auto mt-4 flex max-w-md flex-wrap items-center justify-center gap-3">
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            className="rounded-lg border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
          >
            {MEDIA_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="gold"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Choose Files
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && void handleFiles(e.target.files)}
          />
        </div>
      </div>

      {progress.length > 0 && (
        <div className="space-y-3 rounded-xl border border-luxury-gold/15 bg-black/20 p-4">
          {progress.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              {p.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.preview} alt="" className="h-12 w-12 rounded object-cover" />
              ) : (
                <div className="h-12 w-12 rounded bg-white/10" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white/80">{p.name}</p>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn("h-full rounded-full transition-all", p.error ? "bg-red-500" : "bg-luxury-gold")}
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
                {p.error ? <p className="text-xs text-red-400">{p.error}</p> : null}
              </div>
              <span className="text-xs text-white/50">{p.percent}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search images…"
            className="w-full rounded-lg border border-luxury-gold/20 bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="All">All categories</option>
            {MEDIA_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded-lg border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
          </select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() => setView(view === "grid" ? "list" : "grid")}
          >
            {view === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <p className="text-xs text-white/40">{filtered.length} image{filtered.length === 1 ? "" : "s"}</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div
          className={cn(
            view === "grid"
              ? "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col gap-2"
          )}
        >
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={cn(
                "group overflow-hidden rounded-xl border text-left transition",
                selectedId === item.id
                  ? "border-luxury-gold shadow-[0_0_0_1px_rgba(201,164,76,0.5)]"
                  : "border-white/10 hover:border-luxury-gold/40",
                view === "list" && "flex items-center gap-3 p-2"
              )}
            >
              <div className={cn("relative bg-black/30", view === "grid" ? "aspect-square" : "h-16 w-16 shrink-0 rounded-lg")}>
                <SafeImage src={item.url} alt={item.alt || item.title || item.filename} fill className="object-cover" />
              </div>
              <div className={cn(view === "grid" ? "p-2" : "min-w-0 flex-1")}>
                <p className="truncate text-sm text-white">{item.title || item.filename}</p>
                <p className="truncate text-[10px] uppercase tracking-wider text-white/40">
                  {item.category || categoryFromFolder(item.folder)}
                </p>
              </div>
            </button>
          ))}
          {!filtered.length && (
            <p className="col-span-full py-12 text-center text-sm text-white/40">
              No images yet. Drag files above or choose files to upload.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-luxury-gold/15 bg-black/25 p-4 lg:sticky lg:top-4 lg:self-start">
          {selected ? (
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                <SafeImage src={selected.url} alt={selected.alt || selected.title || ""} fill className="object-cover" />
              </div>
              <AdminInput
                label="Title"
                value={selected.title || ""}
                onChange={(e) => patchAsset(selected.id, { title: e.target.value })}
              />
              <AdminInput
                label="Alt Text"
                value={selected.alt || ""}
                onChange={(e) => patchAsset(selected.id, { alt: e.target.value })}
              />
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.2em] text-luxury-gold/70">
                  Category
                </label>
                <select
                  value={selected.category || categoryFromFolder(selected.folder)}
                  onChange={(e) => patchAsset(selected.id, { category: e.target.value })}
                  className="w-full rounded-lg border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
                >
                  {MEDIA_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <p className="break-all rounded-lg bg-black/40 p-2 text-[11px] text-white/50">{selected.url}</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" className="border-luxury-gold/30 text-luxury-gold" onClick={() => void copyUrl(selected)}>
                  {copiedId === selected.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy URL
                </Button>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-luxury-gold/30 px-3 py-1.5 text-sm text-luxury-gold">
                  <Replace className="h-4 w-4" />
                  Replace
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void replaceAsset(selected, file);
                    }}
                  />
                </label>
                <Button type="button" size="sm" variant="ghost" className="text-red-400" onClick={() => void removeAsset(selected)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-white/40">Select an image to edit details</p>
          )}
        </div>
      </div>
    </div>
  );
}
