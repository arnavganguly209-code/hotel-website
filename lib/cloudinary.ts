import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function configureCloudinary(): void {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured");
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  configured = true;
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com/");
}

/** Extract Cloudinary public_id from a secure_url when public_id was not stored. */
export function publicIdFromUrl(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    const afterUpload = parts.slice(uploadIndex + 1);
    const withoutVersion = afterUpload[0]?.startsWith("v") && /^\d+$/.test(afterUpload[0].slice(1))
      ? afterUpload.slice(1)
      : afterUpload;
    const joined = withoutVersion.join("/");
    const lastDot = joined.lastIndexOf(".");
    return lastDot === -1 ? joined : joined.slice(0, lastDot);
  } catch {
    return null;
  }
}

export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<void> {
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export async function deleteCloudinaryByUrl(
  url: string,
  resourceType: "image" | "video" = "image"
): Promise<void> {
  const publicId = publicIdFromUrl(url);
  if (!publicId) return;
  try {
    await deleteCloudinaryAsset(publicId, resourceType);
  } catch (error) {
    console.warn("[Cloudinary] Failed to delete asset:", publicId, error);
  }
}
