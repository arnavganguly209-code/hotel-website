import { promises as fs } from "fs";
import path from "path";
import type { SiteContent } from "./types";
import { defaultContent } from "./default-content";
import { mergeWithDefaults } from "./merge";
import { isDatabaseAvailable, db } from "@/lib/db";

const CONTENT_PATH = path.join(process.cwd(), "data", "site-content.json");
const RECORD_ID = "main";

async function readFromFile(): Promise<SiteContent | null> {
  try {
    const raw = await fs.readFile(CONTENT_PATH, "utf-8");
    return mergeWithDefaults(JSON.parse(raw) as Partial<SiteContent>);
  } catch {
    return null;
  }
}

async function readFromDatabase(): Promise<SiteContent | null> {
  if (!isDatabaseAvailable()) return null;
  try {
    const record = await db.siteContentRecord.findUnique({ where: { id: RECORD_ID } });
    if (!record?.content) return null;
    return mergeWithDefaults(record.content as Partial<SiteContent>);
  } catch (error) {
    console.warn("[CMS] Database read failed, using fallback.", error);
    return null;
  }
}

export async function getContent(): Promise<SiteContent> {
  const fromDb = await readFromDatabase();
  if (fromDb) return fromDb;

  const fromFile = await readFromFile();
  if (fromFile) return fromFile;

  return defaultContent;
}

export async function saveContent(content: SiteContent): Promise<void> {
  const merged = mergeWithDefaults(content);

  if (!isDatabaseAvailable()) {
    throw new Error("Database not available");
  }

  await db.siteContentRecord.upsert({
    where: { id: RECORD_ID },
    create: {
      id: RECORD_ID,
      content: merged as object,
    },
    update: {
      content: merged as object,
    },
  });
}

export async function createBackup(label?: string): Promise<void> {
  const content = await getContent();
  if (!isDatabaseAvailable()) {
    const backupPath = path.join(process.cwd(), "data", `backup-${Date.now()}.json`);
    await fs.writeFile(backupPath, JSON.stringify(content, null, 2), "utf-8");
    return;
  }
  await db.contentBackup.create({
    data: { label: label ?? `Backup ${new Date().toISOString()}`, content: content as object },
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
