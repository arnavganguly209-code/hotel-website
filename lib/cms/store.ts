import { unstable_noStore as noStore } from "next/cache";
import type { SiteContent } from "./types";
import { defaultContent } from "./default-content";
import { mergeWithDefaults } from "./merge";
import { CMS_CONTENT_TAG } from "./revalidate";
import { isDatabaseAvailable, db } from "@/lib/db";

const RECORD_ID = "main";

/**
 * CMS content is sourced exclusively from PostgreSQL (Hostinger VPS localhost).
 * mergeWithDefaults is only used to hydrate missing schema keys — never to override saved values.
 */
export async function getContent(): Promise<SiteContent> {
  noStore();

  if (!isDatabaseAvailable()) {
    console.error("[CMS] DATABASE_URL is not configured — cannot load CMS content.");
    return mergeWithDefaults({});
  }

  try {
    const record = await db.siteContentRecord.findUnique({ where: { id: RECORD_ID } });
    if (!record?.content) {
      return mergeWithDefaults({});
    }
    return mergeWithDefaults(record.content as Partial<SiteContent>);
  } catch (error) {
    console.error("[CMS] Database read failed — serving merged defaults:", error);
    return mergeWithDefaults({});
  }
}

/** Persist exact CMS payload from Orbit — no default merge on write. */
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
