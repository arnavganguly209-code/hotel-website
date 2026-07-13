import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { configureCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

function resourceTypeFromMime(mime: string): "image" | "video" | "raw" {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("image/")) return "image";
  return "raw";
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    configureCloudinary();
    const { v2: cloudinary } = await import("cloudinary");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";
    const oldPublicId = (formData.get("oldPublicId") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const resourceType = resourceTypeFromMime(file.type || "image/jpeg");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dataUri = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: resourceType,
    });

    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: resourceType });
      } catch (error) {
        console.warn("[Upload] Could not delete replaced asset:", oldPublicId, error);
      }
    }

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("[Upload] Failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
