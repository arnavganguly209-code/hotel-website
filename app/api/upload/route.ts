import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import { isBundledPaymentUrl, stripUrlQuery } from "@/lib/cms/payment-logos";
import {
  UploadError,
  deleteLocalUpload,
  resolveLocalUploadPath,
  saveUploadedFile,
  sanitizeFolder,
  verifyUploadHttpReachable,
  verifyUploadsWritable,
} from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Authenticated local-storage health check. */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await verifyUploadsWritable();
  return NextResponse.json(
    {
      ok: status.ok,
      storage: "local",
      root: status.root,
      cwd: status.cwd,
      message: status.message,
      note:
        "Runtime uploads are served by app/uploads/[...path] because Next.js production does not hot-serve new public/ files.",
    },
    { status: status.ok ? 200 : 500 }
  );
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let folder = "general";
  let writtenPath: string | null = null;

  try {
    console.info("[Upload] Upload started");

    const writable = await verifyUploadsWritable();
    if (!writable.ok) {
      console.error("[Upload] Storage unavailable:", writable);
      return NextResponse.json(
        {
          error: `Storage unavailable. ${writable.message}. root=${writable.root} cwd=${writable.cwd}`,
          code: "STORAGE_UNAVAILABLE",
          root: writable.root,
          cwd: writable.cwd,
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    folder = sanitizeFolder((formData.get("folder") as string) || "general");
    const oldPublicId = ((formData.get("oldPublicId") as string) || "").trim();
    const oldUrl = ((formData.get("oldUrl") as string) || "").trim();

    if (!file) {
      return NextResponse.json(
        { error: "No file provided", code: "NO_FILE" },
        { status: 400 }
      );
    }

    console.info("[Upload] Validation", {
      name: file.name,
      type: file.type,
      size: file.size,
      folder,
      root: writable.root,
      cwd: writable.cwd,
      oldUrl: oldUrl || null,
    });

    const mimeType = file.type || "application/octet-stream";
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await saveUploadedFile({
      buffer,
      originalName: file.name || "upload",
      mimeType,
      folder,
    });
    writtenPath = result.absolutePath;

    // HTTP reachability — must be 200 before we call this a success.
    // Next.js production 404s files written into public/ after boot; we serve via /uploads route.
    const httpProbe = await verifyUploadHttpReachable(
      result.url,
      new URL(request.url).origin
    );
    if (!httpProbe.ok) {
      console.error("[Upload] HTTP probe failed after disk write", {
        url: result.url,
        absolutePath: result.absolutePath,
        probe: httpProbe,
      });
      await deleteLocalUpload(result.url).catch(() => undefined);
      writtenPath = null;
      return NextResponse.json(
        {
          error: `Upload saved to disk but is not publicly reachable (HTTP ${httpProbe.status || "n/a"}). ${httpProbe.detail}. File was rolled back. Path: ${result.url}. Storage root: ${writable.root}`,
          code: "HTTP_PROBE_FAILED",
          status: httpProbe.status,
          probedUrl: httpProbe.probedUrl,
          absolutePath: result.absolutePath,
          root: writable.root,
        },
        { status: 500 }
      );
    }

    // Only delete replaced LOCAL uploads — never touch bundled /media assets
    // and never delete until the new file is verified HTTP 200.
    const replaceTarget = oldPublicId || oldUrl;
    let deletedOld = false;
    if (replaceTarget && !isBundledPaymentUrl(replaceTarget)) {
      const absOld = resolveLocalUploadPath(replaceTarget);
      if (absOld) {
        try {
          const del = await deleteLocalUpload(replaceTarget);
          deletedOld = del.deleted;
          console.info("[Upload] Replaced old local file", {
            old: stripUrlQuery(replaceTarget),
            deleted: del.deleted,
          });
        } catch (error) {
          console.warn("[Upload] Could not delete replaced local file:", replaceTarget, error);
        }
      }
    }

    revalidateSiteContent();

    const cacheBust = Date.now();
    const urlWithBust = `${result.url}?v=${cacheBust}`;

    console.info("[Upload] Upload completed", {
      folder,
      publicId: result.publicId,
      url: result.url,
      urlWithBust,
      bytes: result.bytes,
      absolutePath: result.absolutePath,
      diskVerified: true,
      httpVerified: true,
      httpDetail: httpProbe.detail,
      deletedOld,
    });

    return NextResponse.json({
      url: result.url,
      urlWithBust,
      public_id: result.publicId,
      resource_type: mimeType.startsWith("video/") ? "video" : "image",
      bytes: result.bytes,
      absolutePath: result.absolutePath,
      verified: true,
      diskVerified: true,
      httpVerified: true,
      httpStatus: httpProbe.status,
      deletedOld,
    });
  } catch (error) {
    if (writtenPath) {
      await deleteLocalUpload(writtenPath).catch(() => undefined);
    }

    if (error instanceof UploadError) {
      console.error("[Upload] Failed (UploadError):", error.message);
      return NextResponse.json(
        { error: error.message, code: "UPLOAD_ERROR" },
        { status: error.status }
      );
    }

    console.error("[Upload] Failed:", error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
        code: "UPLOAD_FAILED",
      },
      { status: 500 }
    );
  }
}
