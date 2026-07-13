import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import {
  cloudinarySafeLog,
  deleteCloudinaryAsset,
  formatUploadError,
  getCloudinary,
  getCloudinaryDebugInfo,
  uploadCloudinaryBuffer,
  verifyCloudinaryCredentials,
  type CloudinaryResourceType,
} from "@/lib/cloudinary";
import { revalidateSiteContent } from "@/lib/cms/revalidate";

export const dynamic = "force-dynamic";

function resourceTypeFromMime(mime: string): CloudinaryResourceType {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("image/")) return "image";
  return "raw";
}

function sanitizeFolder(folder: string): string {
  return folder
    .trim()
    .replace(/[^a-zA-Z0-9_/-]/g, "")
    .replace(/^\/+|\/+$/g, "")
    .slice(0, 80) || "uploads";
}

/** Authenticated credential check — safe for production debugging (no secrets exposed). */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { creds } = getCloudinary();
    const verification = await verifyCloudinaryCredentials();
    const debug = getCloudinaryDebugInfo();
    return NextResponse.json(
      {
        ok: verification.ok,
        ...cloudinarySafeLog(creds),
        credentialSource: creds.source,
        message: verification.message,
        debug,
      },
      { status: verification.ok ? 200 : 500 }
    );
  } catch (error) {
    const formatted = formatUploadError(error);
    return NextResponse.json(
      { ok: false, error: formatted.message, code: formatted.code, debug: formatted.debug },
      { status: 500 }
    );
  }
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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    const resourceType = resourceTypeFromMime(mimeType);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }

    const { creds } = getCloudinary();
    console.info("[Upload] Starting", cloudinarySafeLog(creds, folder));

    const result = await uploadCloudinaryBuffer(buffer, {
      folder,
      resourceType,
      mimeType,
    });

    if (oldPublicId) {
      try {
        await deleteCloudinaryAsset(oldPublicId, resourceType);
        console.info("[Upload] Replaced asset — deleted previous public_id:", oldPublicId);
      } catch (error) {
        console.warn("[Upload] Could not delete replaced asset:", oldPublicId, error);
      }
    }

    revalidateSiteContent();

    console.info("[Upload] Success", {
      ...cloudinarySafeLog(creds, folder),
      publicId: result.public_id,
      version: result.version,
      bytes: buffer.length,
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: resourceType,
      version: result.version,
    });
  } catch (error) {
    const formatted = formatUploadError(error);
    console.error("[Upload] Failed:", {
      message: formatted.message,
      code: formatted.code,
      folder,
      debug: formatted.debug,
      raw: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: formatted.message,
        code: formatted.code,
        debug: formatted.debug,
      },
      { status: 500 }
    );
  }
}
