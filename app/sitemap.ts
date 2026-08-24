import type { MetadataRoute } from "next";
import { roomPublicSlug } from "@/lib/booking/utils";
import { getContent } from "@/lib/cms/store";
import { routes, legalSectionPath, LEGAL_SECTIONS } from "@/lib/navigation";
import { SITE_URL } from "@/lib/seo";
import { getRouteSeo, PUBLIC_SEO_PAGES } from "@/lib/seo/page-catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();

  const staticEntries: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: routes.home, priority: 1, changeFrequency: "weekly" },
    { path: routes.rooms, priority: 0.9, changeFrequency: "weekly" },
    { path: routes.dining, priority: 0.85, changeFrequency: "monthly" },
    { path: routes.spa, priority: 0.85, changeFrequency: "monthly" },
    { path: routes.gallery, priority: 0.8, changeFrequency: "weekly" },
    { path: routes.articles, priority: 0.85, changeFrequency: "weekly" },
    { path: routes.meetingsEvents, priority: 0.8, changeFrequency: "monthly" },
    { path: routes.about, priority: 0.75, changeFrequency: "monthly" },
    { path: routes.contact, priority: 0.85, changeFrequency: "monthly" },
    { path: routes.culturalExperience, priority: 0.7, changeFrequency: "monthly" },
    ...LEGAL_SECTIONS.map((section) => ({
      path: legalSectionPath(section),
      priority: 0.3,
      changeFrequency: "yearly" as const,
    })),
  ];

  const seen = new Set<string>();
  const pushUnique = (
    entries: MetadataRoute.Sitemap,
    entry: MetadataRoute.Sitemap[number]
  ) => {
    if (seen.has(entry.url)) return;
    seen.add(entry.url);
    entries.push(entry);
  };

  const out: MetadataRoute.Sitemap = [];

  const isNoindex = (robots?: string) => (robots || "").toLowerCase().includes("noindex");

  for (const { path, priority, changeFrequency } of staticEntries) {
    const catalogPage = PUBLIC_SEO_PAGES.find((page) => page.path === path);
    if (catalogPage && isNoindex(getRouteSeo(content, catalogPage).robots)) continue;
    pushUnique(out, {
      url: `${SITE_URL}${path === "/" ? "" : path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    });
  }

  for (const room of content.rooms) {
    if (room.available === false) continue;
    if (isNoindex(room.seo?.robots)) continue;
    const slug = roomPublicSlug(room);
    if (!slug) continue;
    pushUnique(out, {
      url: `${SITE_URL}/rooms/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const article of content.articles) {
    if (article.status !== "published" || !article.slug) continue;
    if (isNoindex(article.seo?.robots)) continue;
    pushUnique(out, {
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: article.updatedAt
        ? new Date(article.updatedAt)
        : new Date(article.publishedAt),
      changeFrequency: "monthly",
      priority: article.featured ? 0.75 : 0.65,
    });
  }

  return out;
}
