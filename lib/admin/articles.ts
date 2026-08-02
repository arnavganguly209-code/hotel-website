import type { SiteContent } from "@/lib/cms/types";
import { getContent, saveContent } from "@/lib/cms/store";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import { applyScheduledPublishes } from "@/lib/admin/articles-shared";

export * from "@/lib/admin/articles-shared";

export async function loadArticlesContent(): Promise<SiteContent> {
  const content = await getContent();
  const { content: next, changed } = applyScheduledPublishes(content);
  if (changed) {
    await saveContent(next);
    revalidateSiteContent();
  }
  return next;
}

export async function mutateArticlesContent(
  mutator: (content: SiteContent) => SiteContent
): Promise<SiteContent> {
  const current = await loadArticlesContent();
  const next = mutator(current);
  await saveContent(next);
  revalidateSiteContent();
  return next;
}
