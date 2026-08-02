"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { slugifyArticle } from "@/lib/admin/articles-shared";

type Category = {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  order: number;
};

export default function AdminArticleCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/articles/meta", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setError(data.error || "Failed to load");
    } else {
      setCategories(data.categories || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (next: Category[]) => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/articles/meta", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: next }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || !data.success) {
      setError(data.error || "Save failed");
      return;
    }
    setCategories(data.categories || next);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Articles</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Categories</h1>
        <p className="mt-2 text-sm text-[#5a635c]">Organize editorial content by topic.</p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="min-w-[220px] flex-1 rounded-lg border border-[#c5a059]/35 px-3 py-2.5 text-sm"
        />
        <button
          type="button"
          disabled={saving || !name.trim()}
          onClick={() => {
            const item: Category = {
              id: `cat-${Date.now()}`,
              name: name.trim(),
              slug: slugifyArticle(name),
              enabled: true,
              order: categories.length,
            };
            setName("");
            void save([...categories, item]);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#0f2420] px-4 py-2.5 text-sm text-[#f0dfb0]"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-[#5a635c]" />
      ) : (
        <div className="space-y-2">
          {categories.map((c, i) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-[#c5a059]/15 bg-white/80 px-4 py-3"
            >
              <input
                value={c.name}
                onChange={(e) => {
                  const next = [...categories];
                  next[i] = {
                    ...c,
                    name: e.target.value,
                    slug: slugifyArticle(e.target.value),
                  };
                  setCategories(next);
                }}
                onBlur={() => void save(categories)}
                className="min-w-[180px] flex-1 rounded-lg border border-[#c5a059]/25 px-3 py-2 text-sm"
              />
              <span className="text-xs text-[#7a8a82]">/{c.slug}</span>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={c.enabled !== false}
                  onChange={(e) => {
                    const next = [...categories];
                    next[i] = { ...c, enabled: e.target.checked };
                    void save(next);
                  }}
                />
                Enabled
              </label>
              <button
                type="button"
                onClick={() => void save(categories.filter((x) => x.id !== c.id))}
                className="rounded-lg border border-red-200 p-2 text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
