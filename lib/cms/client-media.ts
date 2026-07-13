export interface UploadResult {
  url: string;
  publicId: string;
  resourceType?: "image" | "video";
}

export async function deleteCmsMedia(options: {
  url?: string;
  publicId?: string;
  resourceType?: "image" | "video";
}): Promise<void> {
  if (!options.url && !options.publicId) return;

  await fetch("/api/media", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: options.url,
      publicId: options.publicId,
      resourceType: options.resourceType ?? "image",
    }),
  }).catch((error) => {
    console.warn("[CMS] Media delete request failed:", error);
  });
}
