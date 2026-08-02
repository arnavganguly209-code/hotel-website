"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import type { SiteContent } from "@/lib/cms/types";

export default function AdminArticlesSeoSettingsPage() {
  const [page, setPage] = useState<SiteContent["articlesPage"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/articles/meta", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.success) setError(data.error || "Failed");
    else setPage(data.articlesPage);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!page) return;
    setSaving(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/admin/articles/meta", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articlesPage: page }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || !data.success) {
      setError(data.error || "Save failed");
      return;
    }
    setPage(data.articlesPage);
    setMessage("SEO settings saved");
  };

  if (loading || !page) {
    return (
      <div className="flex items-center gap-2 text-[#5a635c]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  const input =
    "mt-1.5 w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none";
  const label = "block text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Articles</p>
          <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">SEO Settings</h1>
          <p className="mt-2 text-sm text-[#5a635c]">
            Defaults for the public /articles listing page.
          </p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="inline-flex items-center gap-2 rounded-full bg-[#0f2420] px-5 py-2.5 text-sm text-[#f0dfb0]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Settings
        </button>
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5 md:grid-cols-2">
        <label className={label}>
          Page SEO Title
          <input
            className={input}
            value={page.seo.title}
            onChange={(e) => setPage({ ...page, seo: { ...page.seo, title: e.target.value } })}
          />
        </label>
        <label className={label}>
          Canonical
          <input
            className={input}
            value={page.seo.canonical || ""}
            onChange={(e) =>
              setPage({ ...page, seo: { ...page.seo, canonical: e.target.value } })
            }
          />
        </label>
        <label className={`${label} md:col-span-2`}>
          Meta Description
          <textarea
            rows={3}
            className={input}
            value={page.seo.description}
            onChange={(e) =>
              setPage({ ...page, seo: { ...page.seo, description: e.target.value } })
            }
          />
        </label>
        <label className={label}>
          Keywords
          <input
            className={input}
            value={page.seo.keywords || ""}
            onChange={(e) =>
              setPage({ ...page, seo: { ...page.seo, keywords: e.target.value } })
            }
          />
        </label>
        <label className={label}>
          Listing Eyebrow
          <input
            className={input}
            value={page.eyebrow}
            onChange={(e) => setPage({ ...page, eyebrow: e.target.value })}
          />
        </label>
        <label className={label}>
          Listing Title
          <input
            className={input}
            value={page.title}
            onChange={(e) => setPage({ ...page, title: e.target.value })}
          />
        </label>
        <label className={`${label} md:col-span-2`}>
          Listing Description
          <textarea
            rows={3}
            className={input}
            value={page.description}
            onChange={(e) => setPage({ ...page, description: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}
