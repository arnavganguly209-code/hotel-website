import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile, access, constants } from "node:fs/promises";
import path from "node:path";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/** Absolute path to public/uploads on the VPS / local machine. */
export function uploadsRoot(): string {
  return path.join(process.cwd(), "public", "uploads");
}

export function sanitizeFolder(folder: string): string {
  return (
    folder
      .trim()
      .replace(/\\/g, "/")
      .replace(/[^a-zA-Z0-9_/-]/g, "")
      .replace(/\.\./g, "")
      .replace(/^\/+|\/+$/g, "")
      .slice(0, 80) || "uploads"
  );
}

function normalizeExt(ext: string): string {
  const lower = ext.toLowerCase();
  return lower === ".jpeg" ? ".jpg" : lower;
}

export function extensionForUpload(fileName: string, mimeType: string): string | null {
  const fromMime = MIME_TO_EXT[mimeType.toLowerCase()];
  if (fromMime) return fromMime;

  const ext = normalizeExt(path.extname(fileName || ""));
  if (ALLOWED_EXTENSIONS.has(ext) || ext === ".jpeg") {
    return normalizeExt(ext);
  }
  return null;
}

export function assertAllowedImage(fileName: string, mimeType: string, size: number): void {
  if (size <= 0) {
    throw new UploadError("Empty file", 400);
  }
  if (size > MAX_UPLOAD_BYTES) {
    throw new UploadError("File too large. Maximum upload size is 10MB.", 400);
  }

  const mime = (mimeType || "").toLowerCase();
  const ext = extensionForUpload(fileName, mime);
  if (!ext || (!ALLOWED_IMAGE_MIME.has(mime) && !ALLOWED_EXTENSIONS.has(ext))) {
    throw new UploadError("Only JPG, JPEG, PNG, and WEBP images are allowed.", 400);
  }
}

export class UploadError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "UploadError";
    this.status = status;
  }
}

/**
 * Resolve a public URL or stored public_id to an absolute file path under public/uploads.
 * Returns null for external / non-local URLs (anything outside /uploads).
 */
export function resolveLocalUploadPath(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;

  let pathname = raw;
  try {
    if (/^https?:\/\//i.test(raw)) {
      pathname = new URL(raw).pathname;
    }
  } catch {
    return null;
  }

  pathname = pathname.replace(/\\/g, "/").split("?")[0].split("#")[0];
  const marker = "/uploads/";
  const idx = pathname.indexOf(marker);
  if (idx === -1) {
    if (pathname.startsWith("uploads/")) {
      pathname = `/${pathname}`;
    } else {
      return null;
    }
  } else {
    pathname = pathname.slice(idx);
  }

  const relative = pathname.replace(/^\/+/, ""); // uploads/...
  if (!relative.startsWith("uploads/") || relative.includes("..")) {
    return null;
  }

  const absolute = path.resolve(process.cwd(), "public", relative);
  const root = path.resolve(uploadsRoot());
  if (!absolute.startsWith(root + path.sep) && absolute !== root) {
    return null;
  }
  return absolute;
}

/** Public URL path returned to the admin UI and stored in CMS. */
export function toPublicUrl(absoluteFilePath: string): string {
  const root = path.resolve(process.cwd(), "public");
  const relative = path.relative(root, absoluteFilePath).replace(/\\/g, "/");
  return `/${relative}`;
}

/** Stable id used by CMS (same as public path without leading slash). */
export function toPublicId(publicUrl: string): string {
  return publicUrl.replace(/^\/+/, "");
}

export async function ensureUploadsDir(folder = "uploads"): Promise<string> {
  const safeFolder = sanitizeFolder(folder);
  const dir = path.join(uploadsRoot(), safeFolder);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function verifyUploadsWritable(): Promise<{
  ok: boolean;
  root: string;
  message: string;
}> {
  const root = uploadsRoot();
  try {
    await mkdir(root, { recursive: true });
    await access(root, constants.W_OK);
    return { ok: true, root, message: "Local uploads directory is writable" };
  } catch (error) {
    return {
      ok: false,
      root,
      message: error instanceof Error ? error.message : "Uploads directory is not writable",
    };
  }
}

export async function saveUploadedFile(options: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder?: string;
}): Promise<{ url: string; publicId: string; absolutePath: string; bytes: number }> {
  const { buffer, originalName, mimeType, folder = "uploads" } = options;
  assertAllowedImage(originalName, mimeType, buffer.length);

  const ext = extensionForUpload(originalName, mimeType);
  if (!ext) {
    throw new UploadError("Only JPG, JPEG, PNG, and WEBP images are allowed.", 400);
  }

  const dir = await ensureUploadsDir(folder);
  const filename = `${randomUUID()}${ext}`;
  const absolutePath = path.join(dir, filename);
  await writeFile(absolutePath, buffer);

  const url = toPublicUrl(absolutePath);
  return {
    url,
    publicId: toPublicId(url),
    absolutePath,
    bytes: buffer.length,
  };
}

/** Delete a local upload by public URL or public_id. Idempotent for missing / external files. */
export async function deleteLocalUpload(input: string): Promise<{
  deleted: boolean;
  publicId: string | null;
}> {
  const absolute = resolveLocalUploadPath(input);
  if (!absolute) {
    return { deleted: false, publicId: null };
  }

  try {
    await unlink(absolute);
    return { deleted: true, publicId: toPublicId(toPublicUrl(absolute)) };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT") {
      return { deleted: false, publicId: toPublicId(toPublicUrl(absolute)) };
    }
    throw error;
  }
}
