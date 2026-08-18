import { cache } from "react";
import type { SiteContent } from "./types";
import { mergeWithDefaults } from "./merge";
import { CMS_CONTENT_TAG } from "./revalidate";
import { isDatabaseAvailable, db } from "@/lib/db";
import { applyScheduledPublishes } from "@/lib/admin/articles-shared";

const RECORD_ID = "main";
const MEMORY_TTL_MS = 20_000;

let memoryCache: { expires: number; content: SiteContent } | null = null;

function clearContentMemoryCache() {
  memoryCache = null;
}

async function readSiteContentFromDb(): Promise<SiteContent> {
  if (!isDatabaseAvailable()) {
    console.error("[CMS] DATABASE_URL is not configured");
    throw new Error("Failed to load site content from database");
  }

  try {
    const record = await db.siteContentRecord.findUnique({ where: { id: RECORD_ID } });
    if (!record?.content) {
      throw new Error("Failed to load site content from database");
    }
    const merged = mergeWithDefaults(record.content as Partial<SiteContent>);

    // Auto-publish due scheduled articles (Admin Articles CMS).
    try {
      const { content: next, changed } = applyScheduledPublishes(merged);
      if (changed) {
        await saveContent(next);
        return next;
      }
    } catch (err) {
      console.error("[CMS] Scheduled publish check failed:", err);
    }

    return merged;
  } catch (error) {
    if (error instanceof Error && error.message === "Failed to load site content from database") {
      throw error;
    }
    console.error("[CMS] Database read failed:", error);
    throw new Error("Failed to load site content from database");
  }
}

/**
 * Load site CMS content from PostgreSQL only.
 * Request-deduped via React cache(); short in-memory TTL for the PM2 process.
 */
export const getContent = cache(async (): Promise<SiteContent> => {
  const now = Date.now();
  if (memoryCache && memoryCache.expires > now) {
    return memoryCache.content;
  }

  const content = await readSiteContentFromDb();
  memoryCache = { expires: now + MEMORY_TTL_MS, content };
  return content;
});

/** Persist exact CMS payload from Orbit - no default merge on write. */
export async function saveContent(content: SiteContent): Promise<void> {
  if (!isDatabaseAvailable()) {
    throw new Error("DATABASE_URL is required to save CMS content");
  }

  await db.siteContentRecord.upsert({
    where: { id: RECORD_ID },
    create: {
      id: RECORD_ID,
      content: content as object,
    },
    update: {
      content: content as object,
    },
  });

  clearContentMemoryCache();

  // Keep relational Room table aligned with Orbit CMS rooms
  const { syncRoomsFromCms } = await import("./sync-rooms");
  await syncRoomsFromCms(content.rooms ?? []);
}

export async function createBackup(label?: string): Promise<void> {
  if (!isDatabaseAvailable()) {
    throw new Error("DATABASE_URL is required to create backups");
  }
  const content = await getContent();
  await db.contentBackup.create({
    data: {
      label: label ?? `Backup ${new Date().toISOString()}`,
      content: content as object,
    },
  });
}

export async function listBackups() {
  if (!isDatabaseAvailable()) return [];
  return db.contentBackup.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, label: true, createdAt: true },
  });
}

export async function restoreBackup(id: string): Promise<boolean> {
  if (!isDatabaseAvailable()) return false;
  const backup = await db.contentBackup.findUnique({ where: { id } });
  if (!backup) return false;
  await saveContent(mergeWithDefaults(backup.content as Partial<SiteContent>));
  return true;
}

export { CMS_CONTENT_TAG };