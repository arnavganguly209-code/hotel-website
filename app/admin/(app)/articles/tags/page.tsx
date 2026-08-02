"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { slugifyArticle } from "@/lib/admin/articles-shared";

type Tag = { id: string; name: string; slug: string };

export default function AdminArticleTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/articles/meta", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.success) setError(data.error || "Failed");
    else setTags(data.tags || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (next: Tag[]) => {
    const res = await fetch("/api/admin/articles/meta", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: next }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setError(data.error || "Save failed");
      return;
    }
    setTags(data.tags || next);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Articles</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Tags</h1>
        <p className="mt-2 text-sm text-[#5a635c]">Flexible labels for discovery and SEO.</p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New tag"
          className="min-w-[220px] flex-1 rounded-lg border border-[#c5a059]/35 px-3 py-2.5 text-sm"
        />
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => {
            const item = {
              id: `tag-${Date.now()}`,
              name: name.trim(),
              slug: slugifyArticle(name),
            };
            setName("");
            void save([...tags, item]);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#0f2420] px-4 py-2.5 text-sm text-[#f0dfb0]"
        >
          <Plus className="h-4 w-4" /> Add Tag
        </button>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/25 bg-white px-3 py-1.5 text-sm"
            >
              {t.name}
              <button type="button" onClick={() => void save(tags.filter((x) => x.id !== t.id))}>
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
