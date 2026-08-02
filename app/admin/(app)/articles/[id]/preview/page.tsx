"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";

export default function AdminArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [article, setArticle] = useState<{
    title: string;
    subtitle?: string;
    excerpt: string;
    body: string;
    coverImage: string;
    coverAlt: string;
    slug: string;
    readingTime: number;
    publishedAt: string;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    void fetch(`/api/admin/articles/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.error || "Failed");
        setArticle(d.article);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, [id]);

  if (error) {
    return <p className="text-red-700">{error}</p>;
  }
  if (!article) {
    return (
      <div className="flex items-center gap-2 text-[#5a635c]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading preview…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Preview</p>
          <h1 className="font-serif text-3xl font-light text-[#0f2420]">Live website preview</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/articles/${id}`}
            className="rounded-full border border-[#c5a059]/40 px-4 py-2 text-sm"
          >
            Back to editor
          </Link>
          <a
            href={`/articles/${article.slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#0f2420] px-4 py-2 text-sm text-[#f0dfb0]"
          >
            Open public URL
          </a>
        </div>
      </div>

      <article className="overflow-hidden rounded-2xl border border-[#c5a059]/20 bg-[#F7F4EF] shadow-sm">
        {article.coverImage ? (
          <div className="relative aspect-[21/9] w-full">
            <SafeImage
              src={article.coverImage}
              alt={article.coverAlt || article.title}
              fill
              objectFit="cover"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="mx-auto max-w-3xl px-6 py-10">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#C9A227]">
            {article.readingTime} min read ·{" "}
            {new Date(article.publishedAt).toLocaleDateString()}
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light text-[#14352C]">{article.title}</h2>
          {article.subtitle ? (
            <p className="mt-3 text-lg text-[#5A635C]">{article.subtitle}</p>
          ) : null}
          <p className="mt-4 text-[#5A635C]">{article.excerpt}</p>
          <div
            className="prose prose-lg mt-10 max-w-none text-[#14352C]"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        </div>
      </article>
    </div>
  );
}
