import type { MetadataRoute } from "next";
import { getContent } from "@/lib/cms/store";
import { routes } from "@/lib/navigation";
import { SITE_URL } from "@/lib/seo";

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
    { path: routes.book, priority: 0.9, changeFrequency: "weekly" },
    { path: routes.availability, priority: 0.7, changeFrequency: "daily" },
    { path: routes.culturalExperience, priority: 0.7, changeFrequency: "monthly" },
    { path: routes.privacy, priority: 0.3, changeFrequency: "yearly" },
    { path: routes.terms, priority: 0.3, changeFrequency: "yearly" },
    { path: routes.legal, priority: 0.3, changeFrequency: "yearly" },
  ];

  const roomEntries = content.rooms.map((room) => ({
    url: `${SITE_URL}/rooms/${room.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const articleEntries = content.articles
    .filter((a) => a.status === "published" && a.slug)
    .map((a) => ({
      url: `${SITE_URL}/articles/${a.slug}`,
      lastModified: a.updatedAt ? new Date(a.updatedAt) : new Date(a.publishedAt),
      changeFrequency: "monthly" as const,
      priority: a.featured ? 0.75 : 0.65,
    }));

  return [
    ...staticEntries.map(({ path, priority, changeFrequency }) => ({
      url: `${SITE_URL}${path === "/" ? "" : path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
    ...roomEntries,
    ...articleEntries,
  ];
}
