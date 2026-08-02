"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";
import type { SiteContent } from "@/lib/cms/types";

type MediaAsset = SiteContent["mediaLibrary"][number];

export default function AdminArticlesMediaPage() {
  const [library, setLibrary] = useState<MediaAsset[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/articles/meta", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.success) setError(data.error || "Failed");
    else setLibrary(data.mediaLibrary || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const blogMedia = useMemo(() => {
    const list = library.filter(
      (m) =>
        (m.folder || "").includes("blog") ||
        (m.category || "").toLowerCase().includes("blog") ||
        (m.url || "").includes("/blog/")
    );
    const source = list.length ? list : library;
    if (!q.trim()) return source;
    const needle = q.toLowerCase();
    return source.filter(
      (m) =>
        (m.title || "").toLowerCase().includes(needle) ||
        (m.alt || "").toLowerCase().includes(needle) ||
        (m.url || "").toLowerCase().includes(needle)
    );
  }, [library, q]);

  const persist = async (next: MediaAsset[]) => {
    const res = await fetch("/api/admin/articles/meta", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaLibrary: next }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setError(data.error || "Save failed");
      return;
    }
    setLibrary(data.mediaLibrary || next);
  };

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "blog");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      const asset: MediaAsset = {
        id: data.publicId || `m-${Date.now()}`,
        url: data.url,
        title: file.name,
        alt: file.name,
        folder: "blog",
        category: "Blog",
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        mediaType: "image",
        visible: true,
        order: library.length,
        createdAt: new Date().toISOString(),
      };
      await persist([asset, ...library]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (item: MediaAsset) => {
    if (!confirm("Delete this media file?")) return;
    await fetch("/api/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: item.url, publicId: item.publicId || item.id }),
    });
    await persist(library.filter((m) => m.id !== item.id && m.url !== item.url));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Articles</p>
          <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Media Library</h1>
          <p className="mt-2 text-sm text-[#5a635c]">Upload, search, copy URL, and manage blog media.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0f2420] px-4 py-2.5 text-sm text-[#f0dfb0]">
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </label>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search media…"
        className="w-full max-w-md rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm"
      />

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {blogMedia.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-2xl border border-[#c5a059]/20 bg-white/80">
              <div className="aspect-[4/3] bg-[#f7f2e9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt || m.title} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2 p-3">
                <input
                  value={m.title || ""}
                  onChange={(e) =>
                    setLibrary((prev) =>
                      prev.map((x) => (x.id === m.id ? { ...x, title: e.target.value } : x))
                    )
                  }
                  onBlur={() => void persist(library)}
                  className="w-full rounded border border-[#c5a059]/20 px-2 py-1 text-sm"
                />
                <input
                  value={m.alt || ""}
                  onChange={(e) =>
                    setLibrary((prev) =>
                      prev.map((x) => (x.id === m.id ? { ...x, alt: e.target.value } : x))
                    )
                  }
                  onBlur={() => void persist(library)}
                  placeholder="Alt text"
                  className="w-full rounded border border-[#c5a059]/20 px-2 py-1 text-xs"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(m.url)}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#c5a059]/30 py-1.5 text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(m)}
                    className="rounded-lg border border-red-200 p-1.5 text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
