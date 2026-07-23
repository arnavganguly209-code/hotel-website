"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { AdminMediaField } from "@/components/admin/AdminMediaField";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import { ArticleRichEditor } from "@/components/admin/articles/ArticleRichEditor";
import type { SiteContent } from "@/lib/cms/types";
import { articleDetailPath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type Article = SiteContent["articles"][number];

interface ArticlesManagerProps {
  content: SiteContent;
  update: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ArticlesManager({ content, update }: ArticlesManagerProps) {
  const page = content.articlesPage;
  const homeSection = content.articlesHomeSection;
  const homeToggle = content.homeSections.articles;
  const articles = content.articles;
  const categories = content.articleCategories;
  const tags = content.articleTags;
  const authors = content.articleAuthors;
  const library = content.mediaLibrary;

  const [selectedId, setSelectedId] = useState<string | null>(
    articles[0]?.id ?? null
  );
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "trash">("all");
  const [preview, setPreview] = useState(false);

  const sorted = useMemo(
    () => [...articles].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [articles]
  );

  const visible = sorted.filter((a) => {
    if (filter === "all") return a.status !== "trash";
    return a.status === filter;
  });

  const selected = articles.find((a) => a.id === selectedId) || null;

  const setArticles = (next: Article[]) => update("articles", next);

  const patchArticle = (id: string, data: Partial<Article>) => {
    setArticles(
      articles.map((a) => {
        if (a.id !== id) return a;
        const next = { ...a, ...data, updatedAt: new Date().toISOString() };
        if (data.body !== undefined || data.title !== undefined) {
          const rev = {
            id: `rev-${Date.now()}`,
            savedAt: new Date().toISOString(),
            title: next.title,
            body: next.body,
          };
          next.revisions = [rev, ...(a.revisions || [])].slice(0, 20);
        }
        return next;
      })
    );
  };

  const addArticle = () => {
    const id = `article-${Date.now()}`;
    const order = articles.length
      ? Math.max(...articles.map((a) => a.order ?? 0)) + 1
      : 0;
    const item: Article = {
      id,
      slug: `new-article-${order}`,
      title: "New Article",
      subtitle: "",
      excerpt: "",
      body: "<p>Start writing your luxury editorial story…</p>",
      coverImage: "",
      coverAlt: "",
      categoryId: categories[0]?.id || "",
      tagIds: [],
      authorId: authors[0]?.id || "",
      readingTime: 5,
      publishedAt: new Date().toISOString(),
      status: "draft",
      featured: false,
      pinned: false,
      allowComments: true,
      relatedIds: [],
      seo: {
        title: "New Article",
        description: "",
        keywords: "",
        canonical: "",
        ogImage: "",
        focusKeyword: "",
      },
      faq: [],
      toc: [],
      revisions: [],
      order,
    };
    setArticles([...articles, item]);
    setSelectedId(id);
  };

  const duplicateArticle = (article: Article) => {
    const id = `article-${Date.now()}`;
    const slug = `${article.slug}-copy`;
    setArticles([
      ...articles,
      {
        ...article,
        id,
        slug,
        title: `${article.title} (Copy)`,
        status: "draft",
        featured: false,
        pinned: false,
        order: articles.length,
        seo: {
          ...article.seo,
          canonical: `/articles/${slug}`,
          title: `${article.title} (Copy)`,
        },
        revisions: [],
      },
    ]);
    setSelectedId(id);
  };

  const uploadImage = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "blog");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) return null;
    update("mediaLibrary", [
      {
        id: data.publicId || data.url,
        url: data.url,
        publicId: data.publicId,
        filename: file.name,
        folder: "blog",
        category: "Blog",
        title: file.name,
        mimeType: file.type,
        size: file.size,
        createdAt: new Date().toISOString(),
      },
      ...library,
    ]);
    return data.url as string;
  };

  return (
    <div className="space-y-8">
      {/* Homepage Latest Articles section */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">
          Homepage · Latest Articles Section
        </p>
        <p className="text-xs text-white/50">
          Slider loads published articles automatically. Manage article content below — no duplicate
          entries needed.
        </p>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={homeSection.enabled !== false}
              onChange={(e) =>
                update("articlesHomeSection", {
                  ...homeSection,
                  enabled: e.target.checked,
                })
              }
              className="accent-luxury-gold"
            />
            Section visible
          </label>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={homeToggle.enabled}
              onChange={(e) =>
                update("homeSections", {
                  ...content.homeSections,
                  articles: { ...homeToggle, enabled: e.target.checked },
                })
              }
              className="accent-luxury-gold"
            />
            Enabled in homepage order
          </label>
        </div>
        <AdminInput
          label="Homepage Order"
          type="number"
          value={homeToggle.order}
          onChange={(e) =>
            update("homeSections", {
              ...content.homeSections,
              articles: { ...homeToggle, order: Number(e.target.value) },
            })
          }
        />
        <AdminInput
          label="Small Label (Eyebrow)"
          value={homeSection.eyebrow}
          onChange={(e) =>
            update("articlesHomeSection", { ...homeSection, eyebrow: e.target.value })
          }
        />
        <AdminInput
          label="Main Heading"
          value={homeSection.title}
          onChange={(e) =>
            update("articlesHomeSection", { ...homeSection, title: e.target.value })
          }
        />
        <AdminTextarea
          label="Description"
          rows={3}
          value={homeSection.description}
          onChange={(e) =>
            update("articlesHomeSection", { ...homeSection, description: e.target.value })
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminInput
            label="Number of Articles"
            type="number"
            value={homeSection.articleLimit}
            onChange={(e) =>
              update("articlesHomeSection", {
                ...homeSection,
                articleLimit: Number(e.target.value),
              })
            }
          />
          <AdminInput
            label="Slider Speed (ms)"
            type="number"
            value={homeSection.slideIntervalMs}
            onChange={(e) =>
              update("articlesHomeSection", {
                ...homeSection,
                slideIntervalMs: Number(e.target.value),
              })
            }
          />
          <AdminInput
            label="Transition Speed (ms)"
            type="number"
            value={homeSection.transitionSpeedMs}
            onChange={(e) =>
              update("articlesHomeSection", {
                ...homeSection,
                transitionSpeedMs: Number(e.target.value),
              })
            }
          />
          <AdminInput
            label="Read Article Button Text"
            value={homeSection.readMoreText}
            onChange={(e) =>
              update("articlesHomeSection", { ...homeSection, readMoreText: e.target.value })
            }
          />
          <AdminInput
            label="Section Padding Y (px)"
            type="number"
            value={homeSection.sectionPaddingY}
            onChange={(e) =>
              update("articlesHomeSection", {
                ...homeSection,
                sectionPaddingY: Number(e.target.value),
              })
            }
          />
          <AdminInput
            label="Card Gap (px)"
            type="number"
            value={homeSection.cardGapPx}
            onChange={(e) =>
              update("articlesHomeSection", {
                ...homeSection,
                cardGapPx: Number(e.target.value),
              })
            }
          />
        </div>
        <div className="flex flex-wrap gap-4">
          {(
            [
              ["autoSlide", "Auto Slide"],
              ["showAuthor", "Show Author"],
              ["showReadingTime", "Show Reading Time"],
              ["showDate", "Show Date"],
              ["showCategory", "Show Category"],
              ["showExcerpt", "Show Excerpt"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-xs text-white/70">
              <input
                type="checkbox"
                checked={Boolean(homeSection[key])}
                onChange={(e) =>
                  update("articlesHomeSection", {
                    ...homeSection,
                    [key]: e.target.checked,
                  })
                }
                className="accent-luxury-gold"
              />
              {label}
            </label>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminInput
            label="Background Top"
            value={homeSection.backgroundTop}
            onChange={(e) =>
              update("articlesHomeSection", {
                ...homeSection,
                backgroundTop: e.target.value,
              })
            }
          />
          <AdminInput
            label="Background Bottom"
            value={homeSection.backgroundBottom}
            onChange={(e) =>
              update("articlesHomeSection", {
                ...homeSection,
                backgroundBottom: e.target.value,
              })
            }
          />
          <AdminInput
            label="Gold Color"
            value={homeSection.goldColor}
            onChange={(e) =>
              update("articlesHomeSection", { ...homeSection, goldColor: e.target.value })
            }
          />
          <AdminInput
            label="Heading Color"
            value={homeSection.headingColor}
            onChange={(e) =>
              update("articlesHomeSection", { ...homeSection, headingColor: e.target.value })
            }
          />
          <AdminInput
            label="Body Color"
            value={homeSection.bodyColor}
            onChange={(e) =>
              update("articlesHomeSection", { ...homeSection, bodyColor: e.target.value })
            }
          />
          <AdminInput
            label="Border Color"
            value={homeSection.borderColor}
            onChange={(e) =>
              update("articlesHomeSection", { ...homeSection, borderColor: e.target.value })
            }
          />
        </div>
      </div>

      {/* Page settings */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Articles Page · Hero</p>
        <AdminInput
          label="Hero Title"
          value={page.hero.title}
          onChange={(e) =>
            update("articlesPage", {
              ...page,
              hero: { ...page.hero, title: e.target.value },
            })
          }
        />
        <AdminInput
          label="Hero Subtitle"
          value={page.hero.subtitle}
          onChange={(e) =>
            update("articlesPage", {
              ...page,
              hero: { ...page.hero, subtitle: e.target.value },
            })
          }
        />
        <AdminTextarea
          label="Hero Description"
          rows={2}
          value={page.hero.description}
          onChange={(e) =>
            update("articlesPage", {
              ...page,
              hero: { ...page.hero, description: e.target.value },
            })
          }
        />
        <AdminMediaField
          label="Cover Image"
          folder="blog"
          category="Blog"
          value={page.hero.media}
          onChange={(media) =>
            update("articlesPage", {
              ...page,
              hero: {
                ...page.hero,
                media,
                imageSrc: media.imageSrc || page.hero.imageSrc,
              },
            })
          }
          library={library}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            label="SEO Title"
            value={page.seo.title}
            onChange={(e) =>
              update("articlesPage", {
                ...page,
                seo: { ...page.seo, title: e.target.value },
              })
            }
          />
          <AdminInput
            label="SEO Keywords"
            value={page.seo.keywords || ""}
            onChange={(e) =>
              update("articlesPage", {
                ...page,
                seo: { ...page.seo, keywords: e.target.value },
              })
            }
          />
        </div>
        <AdminTextarea
          label="SEO Description"
          rows={2}
          value={page.seo.description}
          onChange={(e) =>
            update("articlesPage", {
              ...page,
              seo: { ...page.seo, description: e.target.value },
            })
          }
        />
      </div>

      {/* Categories */}
      <div className="space-y-3 border border-luxury-gold/10 p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-luxury-gold">Categories</p>
          <Button
            type="button"
            size="sm"
            variant="gold"
            onClick={() => {
              const id = `cat-${Date.now()}`;
              update("articleCategories", [
                ...categories,
                {
                  id,
                  name: "New Category",
                  slug: `category-${categories.length + 1}`,
                  enabled: true,
                  order: categories.length,
                },
              ]);
            }}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {categories
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((cat) => (
            <div key={cat.id} className="flex flex-wrap items-center gap-2">
              <input
                value={cat.name}
                onChange={(e) =>
                  update(
                    "articleCategories",
                    categories.map((c) =>
                      c.id === cat.id
                        ? {
                            ...c,
                            name: e.target.value,
                            slug: slugify(e.target.value),
                          }
                        : c
                    )
                  )
                }
                className="min-w-[160px] flex-1 rounded-lg border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
              />
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={cat.enabled !== false}
                  onChange={(e) =>
                    update(
                      "articleCategories",
                      categories.map((c) =>
                        c.id === cat.id ? { ...c, enabled: e.target.checked } : c
                      )
                    )
                  }
                  className="accent-luxury-gold"
                />
                Show
              </label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-red-400"
                onClick={() =>
                  update(
                    "articleCategories",
                    categories.filter((c) => c.id !== cat.id)
                  )
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
      </div>

      {/* Tags */}
      <div className="space-y-3 border border-luxury-gold/10 p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-luxury-gold">Tags</p>
          <Button
            type="button"
            size="sm"
            variant="gold"
            onClick={() => {
              const name = window.prompt("Tag name");
              if (!name) return;
              update("articleTags", [
                ...tags,
                {
                  id: `tag-${Date.now()}`,
                  name,
                  slug: slugify(name),
                },
              ]);
            }}
          >
            <Plus className="h-4 w-4" /> Add Tag
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-2 rounded-full border border-luxury-gold/30 px-3 py-1 text-xs text-white/80"
            >
              {t.name}
              <button
                type="button"
                className="text-red-400"
                onClick={() =>
                  update(
                    "articleTags",
                    tags.filter((x) => x.id !== t.id)
                  )
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Authors */}
      <div className="space-y-3 border border-luxury-gold/10 p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-luxury-gold">Authors</p>
          <Button
            type="button"
            size="sm"
            variant="gold"
            onClick={() =>
              update("articleAuthors", [
                ...authors,
                {
                  id: `author-${Date.now()}`,
                  name: "New Author",
                  designation: "Writer",
                  bio: "",
                  photo: "",
                  social: {},
                },
              ])
            }
          >
            <Plus className="h-4 w-4" /> Add Author
          </Button>
        </div>
        {authors.map((author) => (
          <div
            key={author.id}
            className="grid gap-3 rounded-xl border border-luxury-gold/10 bg-black/20 p-4 sm:grid-cols-2"
          >
            <AdminInput
              label="Name"
              value={author.name}
              onChange={(e) =>
                update(
                  "articleAuthors",
                  authors.map((a) =>
                    a.id === author.id ? { ...a, name: e.target.value } : a
                  )
                )
              }
            />
            <AdminInput
              label="Designation"
              value={author.designation}
              onChange={(e) =>
                update(
                  "articleAuthors",
                  authors.map((a) =>
                    a.id === author.id ? { ...a, designation: e.target.value } : a
                  )
                )
              }
            />
            <div className="sm:col-span-2">
              <AdminTextarea
                label="Bio"
                rows={2}
                value={author.bio}
                onChange={(e) =>
                  update(
                    "articleAuthors",
                    authors.map((a) =>
                      a.id === author.id ? { ...a, bio: e.target.value } : a
                    )
                  )
                }
              />
            </div>
            <div className="sm:col-span-2">
              <ImagePicker
                label="Photo"
                value={author.photo}
                folder="blog"
                category="Blog"
                enableCrop
                library={library}
                onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                onChange={(url) =>
                  update(
                    "articleAuthors",
                    authors.map((a) =>
                      a.id === author.id ? { ...a, photo: url } : a
                    )
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* Articles list + editor */}
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <div className="space-y-3 border border-luxury-gold/10 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-luxury-gold">Articles</p>
            <Button type="button" size="sm" variant="gold" onClick={addArticle}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {(["all", "published", "draft", "trash"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider",
                  filter === f
                    ? "bg-luxury-gold text-black"
                    : "border border-luxury-gold/30 text-white/60"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="max-h-[520px] space-y-1 overflow-y-auto">
            {visible.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedId(a.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                  selectedId === a.id
                    ? "bg-luxury-gold/20 text-luxury-gold"
                    : "text-white/70 hover:bg-white/5"
                )}
              >
                <span className="line-clamp-2 font-medium">{a.title}</span>
                <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-white/40">
                  {a.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {selected ? (
          <div className="space-y-4 border border-luxury-gold/10 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-lg text-luxury-gold">Article Editor</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-luxury-gold/30 text-luxury-gold"
                  onClick={() => setPreview((p) => !p)}
                >
                  <Eye className="h-4 w-4" />
                  {preview ? "Edit" : "Preview"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => duplicateArticle(selected)}
                >
                  <Copy className="h-4 w-4" /> Duplicate
                </Button>
                {selected.status === "trash" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="gold"
                    onClick={() => patchArticle(selected.id, { status: "draft" })}
                  >
                    Restore
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-red-400"
                    onClick={() => patchArticle(selected.id, { status: "trash" })}
                  >
                    <Trash2 className="h-4 w-4" /> Trash
                  </Button>
                )}
                {selected.status === "published" ? (
                  <Link
                    href={articleDetailPath(selected.slug)}
                    target="_blank"
                    className="inline-flex h-8 items-center rounded-md border border-luxury-gold/30 px-3 text-xs text-luxury-gold"
                  >
                    View Live
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminInput
                label="Title"
                value={selected.title}
                onChange={(e) => {
                  const title = e.target.value;
                  patchArticle(selected.id, {
                    title,
                    slug: selected.slug.startsWith("new-article")
                      ? slugify(title)
                      : selected.slug,
                    seo: {
                      ...selected.seo,
                      title: selected.seo.title || title,
                    },
                  });
                }}
              />
              <AdminInput
                label="Slug"
                value={selected.slug}
                onChange={(e) =>
                  patchArticle(selected.id, {
                    slug: slugify(e.target.value),
                    seo: {
                      ...selected.seo,
                      canonical: `/articles/${slugify(e.target.value)}`,
                    },
                  })
                }
              />
            </div>

            <AdminInput
              label="Subtitle"
              value={selected.subtitle || ""}
              onChange={(e) =>
                patchArticle(selected.id, { subtitle: e.target.value })
              }
            />

            <AdminTextarea
              label="Excerpt"
              rows={2}
              value={selected.excerpt}
              onChange={(e) => patchArticle(selected.id, { excerpt: e.target.value })}
            />

            <ImagePicker
              label="Cover / Featured Image"
              value={selected.coverImage}
              folder="blog"
              category="Blog"
              enableCrop
              library={library}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              onChange={(url) =>
                patchArticle(selected.id, {
                  coverImage: url,
                  seo: { ...selected.seo, ogImage: url || selected.seo.ogImage },
                })
              }
            />
            <AdminInput
              label="Cover Alt Text"
              value={selected.coverAlt}
              onChange={(e) => patchArticle(selected.id, { coverAlt: e.target.value })}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-luxury-gold/70">
                  Category
                </label>
                <select
                  value={selected.categoryId}
                  onChange={(e) =>
                    patchArticle(selected.id, { categoryId: e.target.value })
                  }
                  className="w-full rounded-lg border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-luxury-gold/70">
                  Author
                </label>
                <select
                  value={selected.authorId}
                  onChange={(e) =>
                    patchArticle(selected.id, { authorId: e.target.value })
                  }
                  className="w-full rounded-lg border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
                >
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-luxury-gold/70">
                  Status
                </label>
                <select
                  value={selected.status}
                  onChange={(e) =>
                    patchArticle(selected.id, {
                      status: e.target.value as Article["status"],
                    })
                  }
                  className="w-full rounded-lg border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Publish</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="trash">Trash</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-white/70">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.featured}
                  onChange={(e) =>
                    patchArticle(selected.id, { featured: e.target.checked })
                  }
                  className="accent-luxury-gold"
                />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.pinned}
                  onChange={(e) =>
                    patchArticle(selected.id, { pinned: e.target.checked })
                  }
                  className="accent-luxury-gold"
                />
                Pin
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.allowComments}
                  onChange={(e) =>
                    patchArticle(selected.id, { allowComments: e.target.checked })
                  }
                  className="accent-luxury-gold"
                />
                Allow Comments
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminInput
                label="Reading Time (minutes)"
                type="number"
                value={selected.readingTime}
                onChange={(e) =>
                  patchArticle(selected.id, {
                    readingTime: Number(e.target.value) || 1,
                  })
                }
              />
              <AdminInput
                label="Publish Date"
                type="datetime-local"
                value={selected.publishedAt.slice(0, 16)}
                onChange={(e) =>
                  patchArticle(selected.id, {
                    publishedAt: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </div>

            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-luxury-gold/70">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const on = selected.tagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        patchArticle(selected.id, {
                          tagIds: on
                            ? selected.tagIds.filter((id) => id !== t.id)
                            : [...selected.tagIds, t.id],
                        })
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-[10px] uppercase tracking-wider",
                        on
                          ? "border-luxury-gold bg-luxury-gold/20 text-luxury-gold"
                          : "border-luxury-gold/20 text-white/50"
                      )}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {preview ? (
              <div
                className="prose prose-invert max-w-none rounded-xl border border-luxury-gold/20 bg-black/30 p-6"
                dangerouslySetInnerHTML={{ __html: selected.body }}
              />
            ) : (
              <ArticleRichEditor
                value={selected.body}
                onChange={(html) => patchArticle(selected.id, { body: html })}
                onUploadImage={uploadImage}
              />
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminInput
                label="Meta Title"
                value={selected.seo.title}
                onChange={(e) =>
                  patchArticle(selected.id, {
                    seo: { ...selected.seo, title: e.target.value },
                  })
                }
              />
              <AdminInput
                label="Focus Keyword"
                value={selected.seo.focusKeyword || ""}
                onChange={(e) =>
                  patchArticle(selected.id, {
                    seo: { ...selected.seo, focusKeyword: e.target.value },
                  })
                }
              />
              <AdminInput
                label="Canonical URL"
                value={selected.seo.canonical}
                onChange={(e) =>
                  patchArticle(selected.id, {
                    seo: { ...selected.seo, canonical: e.target.value },
                  })
                }
              />
              <AdminInput
                label="Meta Keywords"
                value={selected.seo.keywords}
                onChange={(e) =>
                  patchArticle(selected.id, {
                    seo: { ...selected.seo, keywords: e.target.value },
                  })
                }
              />
              <AdminInput
                label="OG Image URL"
                value={selected.seo.ogImage}
                onChange={(e) =>
                  patchArticle(selected.id, {
                    seo: { ...selected.seo, ogImage: e.target.value },
                  })
                }
              />
            </div>
            <AdminTextarea
              label="Meta Description"
              rows={2}
              value={selected.seo.description}
              onChange={(e) =>
                patchArticle(selected.id, {
                  seo: { ...selected.seo, description: e.target.value },
                })
              }
            />

            {(selected.revisions || []).length > 0 ? (
              <div className="rounded-xl border border-luxury-gold/10 p-4">
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-luxury-gold/70">
                  Revision History
                </p>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {(selected.revisions || []).map((rev) => (
                    <button
                      key={rev.id}
                      type="button"
                      className="block w-full rounded-lg border border-white/10 px-3 py-2 text-left text-xs text-white/60 hover:border-luxury-gold/40"
                      onClick={() =>
                        patchArticle(selected.id, {
                          title: rev.title,
                          body: rev.body,
                        })
                      }
                    >
                      Restore · {new Date(rev.savedAt).toLocaleString()} · {rev.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center justify-center border border-luxury-gold/10 p-16 text-sm text-white/40">
            Select or create an article
          </div>
        )}
      </div>
    </div>
  );
}
