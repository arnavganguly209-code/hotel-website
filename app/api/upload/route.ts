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
      message: status.message,
    },
    { status: status.ok ? 200 : 500 }
  );
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let folder = "uploads";

  try {
    console.info("[Upload] Upload started");

    const writable = await verifyUploadsWritable();
    if (!writable.ok) {
      console.error("[Upload] Storage unavailable:", writable);
      return NextResponse.json(
        {
          error: `Storage unavailable. ${writable.message}`,
          code: "STORAGE_UNAVAILABLE",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    folder = sanitizeFolder((formData.get("folder") as string) || "uploads");
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

    // Only delete replaced LOCAL uploads — never touch bundled /media assets
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
      deletedOld,
    });

    return NextResponse.json({
      url: result.url,
      urlWithBust,
      public_id: result.publicId,
      resource_type: "image",
      bytes: result.bytes,
      verified: true,
      deletedOld,
    });
  } catch (error) {
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
