import { revalidatePath, revalidateTag } from "next/cache";

export const CMS_CONTENT_TAG = "site-content";

const SITE_PATHS = [
  "/",
  "/about",
  "/contact",
  "/gallery",
  "/articles",
  "/rooms",
  "/restaurant",
  "/dining",
  "/spa",
  "/cultural-experience",
  "/meetings-events",
  "/meetings-weddings",
  "/privacy-policy",
  "/terms-and-conditions",
  "/legal",
  "/orbit/dashboard",
] as const;

/** Invalidate every CMS-backed route after content or media changes. */
export function revalidateSiteContent(): void {
  revalidateTag(CMS_CONTENT_TAG);
  revalidatePath("/", "layout");
  for (const route of SITE_PATHS) {
    revalidatePath(route);
  }
  revalidatePath("/rooms/[slug]", "page");
  revalidatePath("/articles/[slug]", "page");
}
