import type { MetadataRoute } from "next";
import { getContent } from "@/lib/cms/store";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DISALLOW = ["/admin", "/orbit", "/api", "/booking/payment"];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await getContent();
  const allow = content.seo.robotsAllow !== false;

  return {
    rules: [
      {
        userAgent: "*",
        allow: allow ? "/" : undefined,
        disallow: allow ? DISALLOW : "/",
      },
      {
        userAgent: "Googlebot",
        allow: allow ? "/" : undefined,
        disallow: allow ? DISALLOW : "/",
      },
      {
        userAgent: "Bingbot",
        allow: allow ? "/" : undefined,
        disallow: allow ? DISALLOW : "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
