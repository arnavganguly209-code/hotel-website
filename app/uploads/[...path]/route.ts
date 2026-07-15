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
      { status: 404 }
    );
  }

  const headers = new Headers({
    "Content-Type": contentTypeFor(file.absolutePath),
    "Content-Length": String(file.size),
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Last-Modified": new Date(file.mtimeMs).toUTCString(),
    "X-Content-Type-Options": "nosniff",
  });

  if (method === "HEAD") {
    return new NextResponse(null, { status: 200, headers });
  }

  const buffer = await readFile(file.absolutePath);
  return new NextResponse(buffer, { status: 200, headers });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return handle(context, "GET");
}

export async function HEAD(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return handle(context, "HEAD");
}
