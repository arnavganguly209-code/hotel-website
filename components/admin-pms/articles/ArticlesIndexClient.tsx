"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  categoryName: string;
  authorName: string;
  status: string;
  publishedAt: string;
  updatedAt?: string;
  views?: number;
  readingTime: number;
  featured: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-800 border-emerald-200",
  draft: "bg-amber-50 text-amber-900 border-amber-200",
  scheduled: "bg-sky-50 text-sky-900 border-sky-200",
  private: "bg-violet-50 text-violet-900 border-violet-200",
  archived: "bg-stone-100 text-stone-700 border-stone-200",
  trash: "bg-red-50 text-red-800 border-red-200",
};

export function ArticlesIndexClient({
  forcedStatus,
  title,
  subtitle,
}: {
  forcedStatus?: string;
  title?: string;
  subtitle?: string;
}) {
  const [items, setItems] = useState<ArticleRow[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(forcedStatus || "all");
  const [categoryId, setCategoryId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const pageSize = 12;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        status: forcedStatus || status,
      });
      if (q) params.set("q", q);
      if (categoryId) params.set("categoryId", categoryId);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/admin/articles?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load");
      setItems(data.articles || []);
      setTotal(data.total || 0);
      setCategories(data.categories || []);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page, q, status, categoryId, from, to, forcedStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  };

  const bulk = async (action: "publish" | "unpublish" | "delete" | "trash") => {
    if (!selected.size) return;
    if (action === "delete" && !confirm(`Permanently delete ${selected.size} article(s)?`)) return;
    if (action === "trash" && !confirm(`Move ${selected.size} article(s) to trash?`)) return;
    const res = await fetch("/api/admin/articles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], action }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      alert(data.error || "Bulk action failed");
      return;
    }
    await load();
  };

  const act = async (id: string, action: string) => {
    if (action === "duplicate") {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate", id }),
      });
      const data = await res.json();
      if (res.ok && data.article?.id) {
        window.location.href = `/admin/articles/${data.article.id}`;
      }
      return;
    }
    if (action === "delete") {
      if (!confirm("Permanently delete this article?")) return;
      await fetch(`/api/admin/articles/${id}?hard=1`, { method: "DELETE" });
      await load();
      return;
    }
    if (action === "trash") {
      await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      await load();
      return;
    }
    if (action === "publish" || action === "unpublish") {
      await fetch("/api/admin/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id], action }),
      });
      await load();
    }
  };

  const heading = useMemo(() => {
    if (title) return title;
    if (forcedStatus === "draft") return "Drafts";
    if (forcedStatus === "scheduled") return "Scheduled Articles";
    return "All Articles";
  }, [title, forcedStatus]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Articles CMS</p>
          <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">{heading}</h1>
          <p className="mt-2 text-sm text-[#5a635c]">
            {subtitle || "WordPress-level editorial management for Hotel Thamel Park."}
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-full bg-[#0f2420] px-5 py-2.5 text-sm font-medium text-[#f0dfb0] shadow-sm transition hover:bg-[#18382f]"
        >
          <Plus className="h-4 w-4" /> Add New Article
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-4 shadow-[0_10px_40px_rgba(15,36,32,0.04)] md:grid-cols-2 xl:grid-cols-5">
        <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
          Search
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Title, slug, author…"
            className="mt-1.5 w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          />
        </label>
        {!forcedStatus ? (
          <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
            Status
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="mt-1.5 w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="private">Private</option>
              <option value="archived">Archived</option>
              <option value="trash">Trash</option>
            </select>
          </label>
        ) : null}
        <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
          Category
          <select
            value={categoryId}
            onChange={(e) => {
              setPage(1);
              setCategoryId(e.target.value);
            }}
            className="mt-1.5 w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setPage(1);
              setFrom(e.target.value);
            }}
            className="mt-1.5 w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none"
          />
        </label>
        <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setPage(1);
              setTo(e.target.value);
            }}
            className="mt-1.5 w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none"
          />
        </label>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#c5a059]/25 bg-[#fbf8f1] px-4 py-3 text-sm">
          <span className="text-[#5a635c]">{selected.size} selected</span>
          <button type="button" onClick={() => bulk("publish")} className="rounded-full border border-emerald-300 px-3 py-1 text-emerald-800">
            Bulk Publish
          </button>
          <button type="button" onClick={() => bulk("unpublish")} className="rounded-full border border-amber-300 px-3 py-1 text-amber-900">
            Bulk Unpublish
          </button>
          <button type="button" onClick={() => bulk("trash")} className="rounded-full border border-red-200 px-3 py-1 text-red-800">
            Bulk Delete
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-[#5a635c]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading articles…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#c5a059]/20 bg-white/80 p-2 shadow-[0_10px_40px_rgba(15,36,32,0.04)]">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.14em] text-[#7a8a82]">
              <tr>
                <th className="px-3 py-3">
                  <button type="button" onClick={toggleAll} aria-label="Select all">
                    {allSelected ? <CheckSquare className="h-4 w-4 text-[#c5a059]" /> : <Square className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-3 py-3">Cover</th>
                <th className="px-3 py-3">Title / Slug</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Author</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Published</th>
                <th className="px-3 py-3">Updated</th>
                <th className="px-3 py-3">Views</th>
                <th className="px-3 py-3">Read</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-t border-[#c5a059]/10 align-middle">
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(a.id)) next.delete(a.id);
                          else next.add(a.id);
                          return next;
                        })
                      }
                    >
                      {selected.has(a.id) ? (
                        <CheckSquare className="h-4 w-4 text-[#c5a059]" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-12 w-16 overflow-hidden rounded-lg border border-[#c5a059]/20 bg-[#f7f2e9]">
                      {a.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.coverImage} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-[#0f2420]">{a.title}</p>
                    <p className="text-xs text-[#7a8a82]">/{a.slug}</p>
                  </td>
                  <td className="px-3 py-3">{a.categoryName}</td>
                  <td className="px-3 py-3">{a.authorName}</td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] capitalize",
                        STATUS_COLORS[a.status] || STATUS_COLORS.draft
                      )}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-[#5a635c]">
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-[#5a635c]">
                    {a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-3">{a.views ?? 0}</td>
                  <td className="px-3 py-3">{a.readingTime}m</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Link
                        href={`/admin/articles/${a.id}`}
                        className="rounded-lg border border-[#c5a059]/30 p-1.5 text-[#0f2420] hover:bg-[#c5a059]/10"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/admin/articles/${a.id}/preview`}
                        className="rounded-lg border border-[#c5a059]/30 p-1.5 hover:bg-[#c5a059]/10"
                        title="Preview"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => act(a.id, "duplicate")}
                        className="rounded-lg border border-[#c5a059]/30 p-1.5 hover:bg-[#c5a059]/10"
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      {a.status !== "published" ? (
                        <button
                          type="button"
                          onClick={() => act(a.id, "publish")}
                          className="rounded-lg border border-emerald-200 px-2 py-1 text-[11px] text-emerald-800"
                        >
                          Publish
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => act(a.id, "unpublish")}
                          className="rounded-lg border border-amber-200 px-2 py-1 text-[11px] text-amber-900"
                        >
                          Unpublish
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => act(a.id, a.status === "trash" ? "delete" : "trash")}
                        className="rounded-lg border border-red-200 p-1.5 text-red-700 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td colSpan={11} className="px-3 py-10 text-center text-[#7a8a82]">
                    No articles found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-[#5a635c]">
        <p>
          {total} article{total === 1 ? "" : "s"} · page {page}/{pages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-[#c5a059]/30 px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-[#c5a059]/30 px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
