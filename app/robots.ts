import type { MetadataRoute } from "next";
import { getContent } from "@/lib/cms/store";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await getContent();
  return {
    rules: {
      userAgent: "*",
      allow: content.seo.robotsAllow ? "/" : "",
      disallow: content.seo.robotsAllow ? ["/orbit", "/api"] : "/",
    },
    sitemap: "https://hotelthamelpark.com/sitemap.xml",
  };
}
