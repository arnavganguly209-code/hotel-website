import { randomUUID } from "node:crypto";
import {
  mkdir,
  unlink,
  writeFile,
  access,
  readFile,
  stat,
  constants,
} from "node:fs/promises";
import path from "node:path";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Absolute uploads root.
 * Prefer UPLOADS_ROOT (Hostinger VPS) so cwd mistakes never write under /tmp or .next.
 * Default: <project>/public/uploads (served by app/uploads/[...path] at runtime).
 */
export function uploadsRoot(): string {
  const fromEnv = (process.env.UPLOADS_ROOT || "").trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }
  return path.join(process.cwd(), "public", "uploads");
}

export const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

export const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg"]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

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
    throw new UploadError(
      "Invalid image. Only PNG, JPG, JPEG, WEBP, and SVG files are allowed.",
      400
    );
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

  // Map /uploads/... → <uploadsRoot>/...
  const underUploads = relative.replace(/^uploads\/?/, "");
  const absolute = path.resolve(uploadsRoot(), underUploads);
  const root = path.resolve(uploadsRoot());
  if (!absolute.startsWith(root + path.sep) && absolute !== root) {
    return null;
  }
  return absolute;
}

/** Public URL path returned to the admin UI and stored in CMS. */
export function toPublicUrl(absoluteFilePath: string): string {
  const root = path.resolve(uploadsRoot());
  const relative = path.relative(root, absoluteFilePath).replace(/\\/g, "/");
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new UploadError("Upload path escaped storage root", 500);
  }
  return `/uploads/${relative}`;
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
  cwd: string;
}> {
  const root = uploadsRoot();
  try {
    await mkdir(root, { recursive: true });
    await access(root, constants.R_OK | constants.W_OK);
    // Prove write + read round-trip
    const probe = path.join(root, `.write-probe-${Date.now()}`);
    await writeFile(probe, Buffer.from("ok"));
    const check = await readFile(probe);
    await unlink(probe);
    if (check.toString() !== "ok") {
      return {
        ok: false,
        root,
        cwd: process.cwd(),
        message: "Write probe failed — bytes read back did not match",
      };
    }
    return {
      ok: true,
      root,
      cwd: process.cwd(),
      message: "Local uploads directory is writable and readable",
    };
  } catch (error) {
    return {
      ok: false,
      root,
      cwd: process.cwd(),
      message: error instanceof Error ? error.message : "Uploads directory is not writable",
    };
  }
}

/** Confirm a public /uploads URL is HTTP 200 (via SITE_URL or loopback). */
export async function verifyUploadHttpReachable(publicUrl: string): Promise<{
  ok: boolean;
  status: number;
  detail: string;
  probedUrl: string;
}> {
  const pathname = publicUrl.split("?")[0];
  if (!pathname.startsWith("/uploads/")) {
    return {
      ok: false,
      status: 0,
      detail: `Refusing to probe non-upload path: ${pathname}`,
      probedUrl: pathname,
    };
  }

  const bases = [
    (process.env.SITE_URL || "").replace(/\/$/, ""),
    (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, ""),
    "http://127.0.0.1:3000",
  ].filter(Boolean);

  let lastStatus = 0;
  let lastDetail = "No base URL available for HTTP probe";
  let lastProbed = pathname;

  for (const base of Array.from(new Set(bases))) {
    const probedUrl = `${base}${pathname}?v=${Date.now()}`;
    lastProbed = probedUrl;
    try {
      const res = await fetch(probedUrl, {
        method: "GET",
        cache: "no-store",
        redirect: "follow",
        headers: { Accept: "image/*,*/*" },
      });
      lastStatus = res.status;
      const ctype = res.headers.get("content-type") || "";
      // Drain / cancel body
      try {
        await res.arrayBuffer();
      } catch {
        /* ignore */
      }

      if (res.ok && (ctype.startsWith("image/") || ctype.includes("octet-stream") || ctype.includes("svg"))) {
        return {
          ok: true,
          status: res.status,
          detail: `HTTP ${res.status} (${ctype || "unknown type"})`,
          probedUrl,
        };
      }

      lastDetail = `HTTP ${res.status} content-type=${ctype || "n/a"} via ${base}`;
    } catch (error) {
      lastDetail =
        error instanceof Error
          ? `Fetch failed via ${base}: ${error.message}`
          : `Fetch failed via ${base}`;
    }
  }

  return { ok: false, status: lastStatus, detail: lastDetail, probedUrl: lastProbed };
}

export async function saveUploadedFile(options: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder?: string;
}): Promise<{
  url: string;
  publicId: string;
  absolutePath: string;
  bytes: number;
  diskVerified: true;
}> {
  const { buffer, originalName, mimeType, folder = "general" } = options;
  assertAllowedImage(originalName, mimeType, buffer.length);

  const ext = extensionForUpload(originalName, mimeType);
  if (!ext) {
    throw new UploadError(
      "Invalid image. Only PNG, JPG, JPEG, WEBP, and SVG files are allowed.",
      400
    );
  }

  const writable = await verifyUploadsWritable();
  if (!writable.ok) {
    throw new UploadError(
      `Storage unavailable. Uploads directory is not writable (${writable.root}). cwd=${writable.cwd}. ${writable.message}`,
      500
    );
  }

  const dir = await ensureUploadsDir(folder);
  const filename = `${randomUUID()}${ext}`;
  const absolutePath = path.join(dir, filename);

  try {
    await writeFile(absolutePath, buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown filesystem error";
    const code = (error as NodeJS.ErrnoException)?.code;
    throw new UploadError(
      `Image write failed${code ? ` (${code})` : ""}: ${message}. Path: ${absolutePath}`,
      500
    );
  }

  // Disk verification — must exist, be readable, and match byte length
  try {
    await access(absolutePath, constants.R_OK);
    const info = await stat(absolutePath);
    if (!info.isFile()) {
      throw new UploadError(`Image write verification failed — not a file: ${absolutePath}`, 500);
    }
    if (info.size !== buffer.length) {
      await unlink(absolutePath).catch(() => undefined);
      throw new UploadError(
        `Image write verification failed — size mismatch (wrote ${buffer.length}, on disk ${info.size}): ${absolutePath}`,
        500
      );
    }
    const head = await readFile(absolutePath);
    if (head.length !== buffer.length) {
      await unlink(absolutePath).catch(() => undefined);
      throw new UploadError(
        `Image write verification failed — could not re-read full file: ${absolutePath}`,
        500
      );
    }
  } catch (error) {
    if (error instanceof UploadError) throw error;
    await unlink(absolutePath).catch(() => undefined);
    const message = error instanceof Error ? error.message : "Unknown verification error";
    throw new UploadError(
      `Image write failed verification — file not readable after save (${absolutePath}): ${message}`,
      500
    );
  }

  const url = toPublicUrl(absolutePath);
  return {
    url,
    publicId: toPublicId(url),
    absolutePath,
    bytes: buffer.length,
    diskVerified: true,
  };
}

const ALLOWED_EVENT_ATTACHMENT_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function extensionForEventAttachment(fileName: string, mimeType: string): string | null {
  const mime = mimeType.toLowerCase();
  if (mime === "application/pdf") return ".pdf";
  return extensionForUpload(fileName, mime);
}

export async function saveEventAttachmentFile(options: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder?: string;
}): Promise<{
  url: string;
  publicId: string;
  absolutePath: string;
  bytes: number;
  diskVerified: true;
}> {
  const { buffer, originalName, mimeType, folder = "events" } = options;
  const mime = (mimeType || "").toLowerCase();

  if (buffer.length <= 0) {
    throw new UploadError("Empty file", 400);
  }
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new UploadError("File too large. Maximum upload size is 10MB.", 400);
  }
  if (!ALLOWED_EVENT_ATTACHMENT_MIME.has(mime)) {
    throw new UploadError(
      "Invalid attachment. Only PDF and image files (PNG, JPG, WEBP) are allowed.",
      400
    );
  }

  const ext = extensionForEventAttachment(originalName, mime);
  if (!ext) {
    throw new UploadError("Unsupported attachment type.", 400);
  }

  const writable = await verifyUploadsWritable();
  if (!writable.ok) {
    throw new UploadError(
      `Storage unavailable. Uploads directory is not writable (${writable.root}). cwd=${writable.cwd}. ${writable.message}`,
      500
    );
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
    diskVerified: true,
  };
}

/** Delete a local upload by public URL, public_id, or absolute path under uploadsRoot. */
export async function deleteLocalUpload(input: string): Promise<{
  deleted: boolean;
  publicId: string | null;
}> {
  let absolute = resolveLocalUploadPath(input);

  // Allow absolute filesystem paths (rollback after failed HTTP probe)
  if (!absolute && input) {
    const resolved = path.resolve(input);
    const root = path.resolve(uploadsRoot());
    if (resolved === root || resolved.startsWith(root + path.sep)) {
      absolute = resolved;
    }
  }

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
