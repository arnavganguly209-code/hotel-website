import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import {
  UploadError,
  deleteLocalUpload,
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
      root: "/public/uploads",
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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    folder = sanitizeFolder((formData.get("folder") as string) || "uploads");
    const oldPublicId = ((formData.get("oldPublicId") as string) || "").trim();
    const oldUrl = ((formData.get("oldUrl") as string) || "").trim();

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await saveUploadedFile({
      buffer,
      originalName: file.name || "upload",
      mimeType,
      folder,
    });

    const replaceTarget = oldPublicId || oldUrl;
    if (replaceTarget) {
      try {
        await deleteLocalUpload(replaceTarget);
      } catch (error) {
        console.warn("[Upload] Could not delete replaced local file:", replaceTarget, error);
      }
    }

    revalidateSiteContent();

    console.info("[Upload] Success", {
      folder,
      publicId: result.publicId,
      url: result.url,
      bytes: result.bytes,
    });

    return NextResponse.json({
      url: result.url,
      public_id: result.publicId,
      resource_type: "image",
    });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("[Upload] Failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
