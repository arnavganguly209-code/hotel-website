import type { Metadata } from "next";
import type { PageSeo, SiteContent } from "@/lib/cms/types";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export type PublicSeoPage = {
  id: string;
  name: string;
  path: string;
  source: "global" | "nested" | "pageSeo";
};

export const PUBLIC_SEO_PAGES: PublicSeoPage[] = [
  { id: "home", name: "Home", path: "/", source: "global" },
  { id: "rooms", name: "Rooms", path: "/rooms", source: "nested" },
  { id: "dining", name: "Dining", path: "/dining", source: "nested" },
  { id: "spa", name: "Spa", path: "/spa", source: "nested" },
  { id: "gallery", name: "Gallery", path: "/gallery", source: "nested" },
  { id: "articles", name: "Articles", path: "/articles", source: "nested" },
  { id: "meetings", name: "Meetings & Events", path: "/meetings-events", source: "nested" },
  { id: "about", name: "About", path: "/about", source: "nested" },
  { id: "contact", name: "Contact", path: "/contact", source: "nested" },
  { id: "cultural", name: "Cultural Experience", path: "/cultural-experience", source: "nested" },
  { id: "legal-privacy", name: "Privacy Policy", path: "/legal/privacy", source: "pageSeo" },
  { id: "legal-terms", name: "Terms & Conditions", path: "/legal/terms", source: "pageSeo" },
  { id: "legal-cancellation", name: "Cancellation Policy", path: "/legal/cancellation", source: "pageSeo" },
  { id: "legal-cookies", name: "Cookie Settings", path: "/legal/cookies", source: "pageSeo" },
  { id: "legal-sitemap", name: "HTML Sitemap", path: "/legal/sitemap", source: "pageSeo" },
];

function nestedSeo(content: SiteContent, path: string): PageSeo | undefined {
  switch (path) {
    case "/rooms":
      return content.roomsPage?.seo;
    case "/dining":
      return content.diningPage?.seo;
    case "/spa":
      return content.spaPage?.seo;
    case "/gallery":
      return content.galleryPage?.seo;
    case "/articles":
      return content.articlesPage?.seo;
    case "/meetings-events":
      return content.meetingsEventsPage?.seo;
    case "/about":
      return content.aboutPage?.seo;
    case "/contact":
      return content.contactPage?.seo;
    case "/cultural-experience":
      return content.culturalExperiencePage?.seo;
    default:
      return undefined;
  }
}

export function getRouteSeo(content: SiteContent, page: PublicSeoPage): PageSeo {
  const override = content.pageSeo?.[page.path];
  if (page.source === "global") {
    return {
      title: override?.title || content.seo.title,
      description: override?.description || content.seo.description,
      canonical: override?.canonical || "/",
      ogImage: override?.ogImage || content.seo.ogImage,
      ogTitle: override?.ogTitle,
      ogDescription: override?.ogDescription,
      robots: override?.robots || content.seo.defaultRobots || "index,follow",
      updatedAt: override?.updatedAt,
    };
  }
  const nested = nestedSeo(content, page.path);
  return {
    title: override?.title || nested?.title || `${page.name} | ${content.hotel.name}`,
    description: override?.description || nested?.description || content.seo.description,
    canonical: override?.canonical || nested?.canonical || page.path,
    ogImage: override?.ogImage || nested?.ogImage || content.seo.ogImage,
    ogTitle: override?.ogTitle || nested?.ogTitle,
    ogDescription: override?.ogDescription || nested?.ogDescription,
    robots: override?.robots || nested?.robots || "index,follow",
    updatedAt: override?.updatedAt || nested?.updatedAt,
  };
}

export function applyRouteSeo(content: SiteContent, path: string, seo: PageSeo): SiteContent {
  const next: SiteContent = {
    ...content,
    pageSeo: { ...(content.pageSeo || {}), [path]: { ...seo, updatedAt: new Date().toISOString() } },
  };

  const assign = (target: PageSeo | undefined) =>
    target
      ? Object.assign(target, {
          title: seo.title,
          description: seo.description,
          canonical: seo.canonical,
          ogImage: seo.ogImage,
          ogTitle: seo.ogTitle,
          ogDescription: seo.ogDescription,
          robots: seo.robots,
          updatedAt: next.pageSeo?.[path]?.updatedAt,
        })
      : undefined;

  if (path === "/") {
    next.seo = {
      ...next.seo,
      title: seo.title,
      description: seo.description,
      ogImage: seo.ogImage || next.seo.ogImage,
    };
  }
  assign(nestedSeo(next, path));
  return next;
}

export function listPublicSeo(content: SiteContent) {
  return PUBLIC_SEO_PAGES.map((page) => {
    const seo = getRouteSeo(content, page);
    return { ...page, seo };
  });
}

export function metadataForPath(content: SiteContent, path: string): Metadata {
  const page =
    PUBLIC_SEO_PAGES.find((item) => item.path === path) ??
    ({
      id: path,
      name: path,
      path,
      source: "pageSeo",
    } satisfies PublicSeoPage);
  return buildPageMetadata(getRouteSeo(content, page), path, content.hotel.name);
}
