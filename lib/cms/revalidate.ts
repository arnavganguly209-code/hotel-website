import { revalidatePath, revalidateTag } from "next/cache";

export const CMS_CONTENT_TAG = "site-content";

const SITE_PATHS = [
  "/",
  "/about",
  "/contact",
  "/gallery",
  "/rooms",
  "/dining",
  "/spa",
  "/cultural-experience",
  "/meetings-weddings",
  "/privacy-policy",
  "/terms-and-conditions",
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
}
