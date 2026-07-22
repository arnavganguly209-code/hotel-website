import { access, readFile, stat } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { resolveLocalUploadPath, uploadsRoot } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serve Orbit uploads at runtime.
 *
 * Next.js production (`next start`) snapshots `public/` at boot — files written
 * after start 404 from the static file server. This route reads the uploads
 * directory on disk so new Orbit uploads are immediately available at /uploads/*.
 */

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return CONTENT_TYPES[ext] || "application/octet-stream";
}

async function resolveUploadFile(pathSegments: string[]) {
  const joined = pathSegments.filter(Boolean).join("/");
  if (!joined || joined.includes("..")) return null;

  const publicUrl = `/uploads/${joined.replace(/^\/+/, "")}`;
  const absolutePath = resolveLocalUploadPath(publicUrl);
  if (!absolutePath) return null;

  try {
    await access(absolutePath, constants.R_OK);
    const info = await stat(absolutePath);
    if (!info.isFile() || info.size <= 0) return null;
    return { absolutePath, size: info.size, mtimeMs: info.mtimeMs };
  } catch {
    return null;
  }
}

async function handle(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
  method: "GET" | "HEAD"
) {
  const { path: segments } = await context.params;
  const file = await resolveUploadFile(segments || []);

  if (!file) {
    console.warn("[Uploads] 404", {
      path: (segments || []).join("/"),
      root: uploadsRoot(),
    });
    return NextResponse.json(
      {
        error: "Upload file not found on disk",
        path: `/uploads/${(segments || []).join("/")}`,
        root: uploadsRoot(),
      },
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  }

  const etag = `"${Math.trunc(file.mtimeMs).toString(36)}-${file.size.toString(36)}"`;
  const headers = new Headers({
    "Content-Type": contentTypeFor(file.absolutePath),
    "Content-Length": String(file.size),
    "Cache-Control": "public, max-age=31536000, immutable",
    "Last-Modified": new Date(file.mtimeMs).toUTCString(),
    ETag: etag,
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  });

  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers });
  }

  if (method === "HEAD") {
    return new NextResponse(null, { status: 200, headers });
  }

  const buffer = await readFile(file.absolutePath);
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Math.min(Number(match[2]), file.size - 1) : file.size - 1;
      if (start <= end && start < file.size) {
        const chunk = buffer.subarray(start, end + 1);
        headers.set("Content-Length", String(chunk.length));
        headers.set("Content-Range", `bytes ${start}-${end}/${file.size}`);
        return new NextResponse(chunk, { status: 206, headers });
      }
    }
    headers.set("Content-Range", `bytes */${file.size}`);
    return new NextResponse(null, { status: 416, headers });
  }
  return new NextResponse(buffer, { status: 200, headers });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return handle(request, context, "GET");
}

export async function HEAD(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return handle(request, context, "HEAD");
}
