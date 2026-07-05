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
    routes.dining,
    routes.spa,
    routes.gallery,
    routes.contact,
    routes.privacy,
    routes.terms,
  ];

  return publicRoutes.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === routes.home ? "weekly" : "monthly",
    priority: path === routes.home ? 1 : 0.8,
  }));
}
