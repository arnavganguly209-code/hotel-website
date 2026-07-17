import type { MetadataRoute } from "next";
import { getContent } from "@/lib/cms/store";
import { routes } from "@/lib/navigation";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const publicRoutes = [
    routes.home,
    routes.about,
    routes.rooms,
    routes.availability,
    routes.book,
    routes.dining,
    routes.spa,
    routes.gallery,
    routes.articles,
    routes.culturalExperience,
    routes.contact,
    routes.privacy,
    routes.terms,
    ...content.rooms.map((room) => `/rooms/${room.id}`),
    ...content.articles
      .filter((a) => a.status === "published")
      .map((a) => `/articles/${a.slug}`),
  ];

  return publicRoutes.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === routes.home ? "weekly" : "monthly",
    priority: path === routes.home ? 1 : 0.8,
  }));
}
