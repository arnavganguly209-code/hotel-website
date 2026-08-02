"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Loader2,
  Save,
  Trash2,
  Upload,
  ExternalLink,
} from "lucide-react";
import { ArticleRichEditor } from "@/components/admin/articles/ArticleRichEditor";
import { analyzeArticleSeo, type SeoAnalysis } from "@/lib/admin/article-seo";
import {
  estimateReadingTime,
  extractExcerpt,
  slugifyArticle,
  type CmsArticle,
} from "@/lib/admin/articles";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/lib/cms/types";

type Meta = {
  categories: SiteContent["articleCategories"];
  tags: SiteContent["articleTags"];
  authors: SiteContent["articleAuthors"];
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]";
const labelClass = "block text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]";

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-700";
  if (score >= 55) return "text-amber-700";
  return "text-red-700";
}

function levelDot(level: "good" | "ok" | "bad") {
  if (level === "good") return "bg-emerald-500";
  if (level === "ok") return "bg-amber-400";
  return "bg-red-500";
}

export function ArticleEditorClient({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const [article, setArticle] = useState<CmsArticle | null>(null);
  const [meta, setMeta] = useState<Meta>({ categories: [], tags: [], authors: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [slugLocked, setSlugLocked] = useState(Boolean(articleId));
  const [seo, setSeo] = useState<SeoAnalysis | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNew = !articleId || articleId === "new";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isNew) {
        const res = await fetch("/api/admin/articles/meta", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to load meta");
        setMeta({
          categories: data.categories || [],
          tags: data.tags || [],
          authors: data.authors || [],
        });
        const blank: CmsArticle = {
          id: "",
          slug: "",
          title: "",
          subtitle: "",
          excerpt: "",
          body: "<p></p>",
          coverImage: "",
          coverAlt: "",
          categoryId: data.categories?.[0]?.id || "",
          tagIds: [],
          authorId: data.authors?.[0]?.id || "",
          readingTime: 1,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "draft",
          featured: false,
          pinned: false,
          allowComments: true,
          relatedIds: [],
          seo: {
            title: "",
            description: "",
            keywords: "",
            canonical: "",
            ogImage: "",
            focusKeyword: "",
            twitterTitle: "",
            twitterDescription: "",
            ogTitle: "",
            ogDescription: "",
            twitterImage: "",
            robots: "index,follow",
            schemaType: "Article",
            breadcrumbTitle: "",
          },
          faq: [],
          toc: [],
          revisions: [],
          scheduledAt: "",
          views: 0,
          internalNotes: "",
          order: 0,
        };
        setArticle(blank);
        setSeo(analyzeArticleSeo(blank));
      } else {
        const res = await fetch(`/api/admin/articles/${articleId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to load article");
        setArticle(data.article);
        setSeo(data.seo || analyzeArticleSeo(data.article));
        setMeta({
          categories: data.categories || [],
          tags: data.tags || [],
          authors: data.authors || [],
        });
        setSlugLocked(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [articleId, isNew]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!article) return;
    setSeo(analyzeArticleSeo(article));
  }, [article]);

  const patch = (partial: Partial<CmsArticle>) => {
    setArticle((prev) => (prev ? { ...prev, ...partial } : prev));
    setMessage("");
  };

  const patchSeo = (partial: Partial<CmsArticle["seo"]>) => {
    setArticle((prev) =>
      prev ? { ...prev, seo: { ...prev.seo, ...partial } } : prev
    );
  };

  const uploadCover = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "blog");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      alert(data.error || "Upload failed");
      return;
    }
    patch({
      coverImage: data.url,
      coverAlt: article?.coverAlt || article?.title || file.name,
    });
    patchSeo({
      ogImage: data.url,
      twitterImage: data.url,
    });
  };

  const uploadInline = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "blog");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) return null;
    return data.url as string;
  };

  const persist = async (statusOverride?: CmsArticle["status"]) => {
    if (!article) return;
    setSaving(true);
    setError("");
    try {
      const nextStatus = statusOverride || article.status;
      const payload: CmsArticle = {
        ...article,
        status: nextStatus,
        slug: slugifyArticle(article.slug || article.title) || `article-${Date.now()}`,
        readingTime: estimateReadingTime(article.body),
        excerpt: article.excerpt.trim() || extractExcerpt(article.body),
        seo: {
          ...article.seo,
          title: article.seo.title || article.title,
          description: article.seo.description || article.excerpt || extractExcerpt(article.body),
          canonical: article.seo.canonical || `/articles/${slugifyArticle(article.slug || article.title)}`,
          ogTitle: article.seo.ogTitle || article.seo.title || article.title,
          ogDescription:
            article.seo.ogDescription || article.seo.description || article.excerpt,
          ogImage: article.seo.ogImage || article.coverImage,
          twitterTitle: article.seo.twitterTitle || article.seo.title || article.title,
          twitterDescription:
            article.seo.twitterDescription || article.seo.description || article.excerpt,
          twitterImage: article.seo.twitterImage || article.seo.ogImage || article.coverImage,
          breadcrumbTitle: article.seo.breadcrumbTitle || article.title,
        },
        updatedAt: new Date().toISOString(),
      };
      if (nextStatus === "published" && !payload.publishedAt) {
        payload.publishedAt = new Date().toISOString();
      }

      if (isNew || !article.id) {
        const res = await fetch("/api/admin/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Create failed");
        setMessage("Article created");
        router.replace(`/admin/articles/${data.article.id}`);
        return;
      }

      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
      setArticle(data.article);
      setSeo(data.seo || analyzeArticleSeo(data.article));
      setMessage(statusOverride === "published" ? "Published" : "Saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Autosave drafts every 25s when editing existing article
  useEffect(() => {
    if (!article?.id || isNew) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      void persist();
    }, 25000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.title, article?.body, article?.seo, article?.id]);

  const liveScore = seo?.score ?? 0;

  if (loading || !article) {
    return (
      <div className="flex items-center gap-2 text-[#5a635c]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading editor…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">
            {isNew ? "New Article" : "Edit Article"}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">
            {article.title || "Untitled article"}
          </h1>
          <p className="mt-2 text-sm text-[#5a635c]">
            Visual + HTML editor · live SEO · autosave for drafts
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {article.id ? (
            <Link
              href={`/admin/articles/${article.id}/preview`}
              className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/40 px-4 py-2.5 text-sm"
            >
              <Eye className="h-4 w-4" /> Preview
            </Link>
          ) : null}
          {article.status === "published" && article.slug ? (
            <a
              href={`/articles/${article.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/40 px-4 py-2.5 text-sm"
            >
              <ExternalLink className="h-4 w-4" /> Live
            </a>
          ) : null}
          <button
            type="button"
            disabled={saving}
            onClick={() => persist("draft")}
            className="rounded-full border border-[#c5a059]/40 px-4 py-2.5 text-sm"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => persist("scheduled")}
            className="rounded-full border border-sky-300 px-4 py-2.5 text-sm text-sky-900"
          >
            Schedule
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => persist(article.id ? undefined : "draft")}
            className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/40 px-4 py-2.5 text-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {article.id ? "Update" : "Save"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => persist("published")}
            className="rounded-full bg-[#0f2420] px-5 py-2.5 text-sm font-medium text-[#f0dfb0]"
          >
            Publish
          </button>
        </div>
      </div>

      {message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5 shadow-sm">
            <label className={labelClass}>
              Article Title
              <input
                className={inputClass}
                value={article.title}
                onChange={(e) => {
                  const title = e.target.value;
                  const next: Partial<CmsArticle> = { title };
                  if (!slugLocked) {
                    const slug = slugifyArticle(title);
                    next.slug = slug;
                    next.seo = {
                      ...article.seo,
                      title: article.seo.title || title,
                      canonical: `/articles/${slug}`,
                      breadcrumbTitle: article.seo.breadcrumbTitle || title,
                    };
                  }
                  patch(next);
                }}
                placeholder="Enter article title"
              />
            </label>
            <label className={`${labelClass} mt-4`}>
              URL Slug
              <div className="mt-1.5 flex gap-2">
                <input
                  className={inputClass + " mt-0"}
                  value={article.slug}
                  onChange={(e) => {
                    setSlugLocked(true);
                    patch({ slug: slugifyArticle(e.target.value) });
                  }}
                />
                <button
                  type="button"
                  className="rounded-lg border border-[#c5a059]/35 px-3 text-xs"
                  onClick={() => {
                    setSlugLocked(false);
                    patch({ slug: slugifyArticle(article.title) });
                  }}
                >
                  Auto
                </button>
              </div>
            </label>
          </div>

          <div className="rounded-2xl border border-[#c5a059]/20 bg-white/90 p-2 shadow-sm">
            <div className="border-b border-[#c5a059]/15 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[#8a7340]">
              Professional editor · Visual / HTML
            </div>
            <ArticleRichEditor
              value={article.body}
              onChange={(body) =>
                patch({
                  body,
                  readingTime: estimateReadingTime(body),
                  excerpt: article.excerpt.trim() ? article.excerpt : extractExcerpt(body),
                })
              }
              onUploadImage={uploadInline}
              theme="admin"
            />
          </div>

          <div className="grid gap-4 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5 md:grid-cols-2">
            <label className={labelClass}>
              Excerpt
              <textarea
                rows={4}
                className={inputClass}
                value={article.excerpt}
                onChange={(e) => patch({ excerpt: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Internal Notes
              <textarea
                rows={4}
                className={inputClass}
                value={article.internalNotes || ""}
                onChange={(e) => patch({ internalNotes: e.target.value })}
              />
            </label>
          </div>

          <div className="space-y-4 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5">
            <p className="font-serif text-xl text-[#0f2420]">SEO & Social</p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                SEO Meta Title
                <input className={inputClass} value={article.seo.title} onChange={(e) => patchSeo({ title: e.target.value })} />
              </label>
              <label className={labelClass}>
                Focus Keyword
                <input className={inputClass} value={article.seo.focusKeyword || ""} onChange={(e) => patchSeo({ focusKeyword: e.target.value })} />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                SEO Meta Description
                <textarea rows={3} className={inputClass} value={article.seo.description} onChange={(e) => patchSeo({ description: e.target.value })} />
              </label>
              <label className={labelClass}>
                SEO Keywords
                <input className={inputClass} value={article.seo.keywords} onChange={(e) => patchSeo({ keywords: e.target.value })} />
              </label>
              <label className={labelClass}>
                Canonical URL
                <input className={inputClass} value={article.seo.canonical} onChange={(e) => patchSeo({ canonical: e.target.value })} />
              </label>
              <label className={labelClass}>
                Robots Meta
                <select className={inputClass} value={article.seo.robots || "index,follow"} onChange={(e) => patchSeo({ robots: e.target.value })}>
                  <option value="index,follow">index,follow</option>
                  <option value="noindex,follow">noindex,follow</option>
                  <option value="index,nofollow">index,nofollow</option>
                  <option value="noindex,nofollow">noindex,nofollow</option>
                </select>
              </label>
              <label className={labelClass}>
                Schema Type
                <select className={inputClass} value={article.seo.schemaType || "Article"} onChange={(e) => patchSeo({ schemaType: e.target.value })}>
                  <option value="Article">Article</option>
                  <option value="BlogPosting">BlogPosting</option>
                  <option value="NewsArticle">NewsArticle</option>
                </select>
              </label>
              <label className={labelClass}>
                Breadcrumb Title
                <input className={inputClass} value={article.seo.breadcrumbTitle || ""} onChange={(e) => patchSeo({ breadcrumbTitle: e.target.value })} />
              </label>
              <label className={labelClass}>
                Open Graph Title
                <input className={inputClass} value={article.seo.ogTitle || ""} onChange={(e) => patchSeo({ ogTitle: e.target.value })} />
              </label>
              <label className={labelClass}>
                Open Graph Description
                <input className={inputClass} value={article.seo.ogDescription || ""} onChange={(e) => patchSeo({ ogDescription: e.target.value })} />
              </label>
              <label className={labelClass}>
                Open Graph Image URL
                <input className={inputClass} value={article.seo.ogImage || ""} onChange={(e) => patchSeo({ ogImage: e.target.value })} />
              </label>
              <label className={labelClass}>
                Twitter Title
                <input className={inputClass} value={article.seo.twitterTitle || ""} onChange={(e) => patchSeo({ twitterTitle: e.target.value })} />
              </label>
              <label className={labelClass}>
                Twitter Description
                <input className={inputClass} value={article.seo.twitterDescription || ""} onChange={(e) => patchSeo({ twitterDescription: e.target.value })} />
              </label>
              <label className={labelClass}>
                Twitter Image URL
                <input className={inputClass} value={article.seo.twitterImage || ""} onChange={(e) => patchSeo({ twitterImage: e.target.value })} />
              </label>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a7340]">Publish</p>
            <label className={`${labelClass} mt-3`}>
              Status
              <select
                className={inputClass}
                value={article.status}
                onChange={(e) => patch({ status: e.target.value as CmsArticle["status"] })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="private">Private</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className={`${labelClass} mt-3`}>
              Publish Date
              <input
                type="datetime-local"
                className={inputClass}
                value={article.publishedAt ? article.publishedAt.slice(0, 16) : ""}
                onChange={(e) =>
                  patch({
                    publishedAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : new Date().toISOString(),
                  })
                }
              />
            </label>
            <label className={`${labelClass} mt-3`}>
              Schedule At
              <input
                type="datetime-local"
                className={inputClass}
                value={article.scheduledAt ? article.scheduledAt.slice(0, 16) : ""}
                onChange={(e) =>
                  patch({
                    scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : "",
                    status: e.target.value ? "scheduled" : article.status,
                  })
                }
              />
            </label>
            <label className="mt-4 flex items-center gap-2 text-sm text-[#0f2420]">
              <input
                type="checkbox"
                checked={article.featured}
                onChange={(e) => patch({ featured: e.target.checked })}
              />
              Featured
            </label>
            <p className="mt-3 text-xs text-[#7a8a82]">
              Reading time: <strong>{article.readingTime} min</strong> (auto)
            </p>
          </div>

          <div className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a7340]">Featured Image</p>
            <div className="mt-3 aspect-[16/10] overflow-hidden rounded-xl border border-[#c5a059]/20 bg-[#f7f2e9]">
              {article.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={article.coverImage} alt={article.coverAlt || ""} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#7a8a82]">No cover</div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#c5a059]/40 px-3 py-2 text-xs">
                <Upload className="h-3.5 w-3.5" /> Upload / Replace
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadCover(file);
                  }}
                />
              </label>
              {article.coverImage ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-2 text-xs text-red-700"
                  onClick={() => patch({ coverImage: "", coverAlt: "" })}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              ) : null}
            </div>
            <label className={`${labelClass} mt-3`}>
              Cover Alt Text
              <input className={inputClass} value={article.coverAlt} onChange={(e) => patch({ coverAlt: e.target.value })} />
            </label>
          </div>

          <div className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5">
            <label className={labelClass}>
              Category
              <select
                className={inputClass}
                value={article.categoryId}
                onChange={(e) => patch({ categoryId: e.target.value })}
              >
                {meta.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${labelClass} mt-3`}>
              Author
              <select
                className={inputClass}
                value={article.authorId}
                onChange={(e) => patch({ authorId: e.target.value })}
              >
                {meta.authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <p className={`${labelClass} mt-3`}>Tags</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {meta.tags.map((t) => {
                const on = article.tagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      patch({
                        tagIds: on
                          ? article.tagIds.filter((id) => id !== t.id)
                          : [...article.tagIds, t.id],
                      })
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      on
                        ? "border-[#c5a059] bg-[#c5a059]/15 text-[#0f2420]"
                        : "border-[#c5a059]/25 text-[#5a635c]"
                    )}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5">
            <div className="flex items-end justify-between">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a7340]">SEO Live Score</p>
              <p className={cn("font-serif text-3xl", scoreColor(liveScore))}>{liveScore}</p>
            </div>
            <div className="mt-4 space-y-2">
              {(seo?.checks || []).map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-xs text-[#5a635c]">
                  <span className={cn("mt-1 h-2 w-2 rounded-full", levelDot(c.level))} />
                  <div>
                    <p className="font-medium text-[#0f2420]">{c.label}</p>
                    <p>{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-[#7a8a82]">
              {seo?.wordCount ?? 0} words · {seo?.charCount ?? 0} characters
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
