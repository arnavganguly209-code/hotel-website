import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import {
  cloudinarySafeLog,
  deleteCloudinaryAsset,
  deleteCloudinaryByUrl,
  getCloudinary,
  publicIdFromUrl,
} from "@/lib/cloudinary";
import { revalidateSiteContent } from "@/lib/cms/revalidate";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      publicId?: string;
      url?: string;
      resourceType?: "image" | "video";
    };

    const resourceType = body.resourceType ?? "image";
    const { creds } = getCloudinary();

    if (body.publicId) {
      console.info("[Media] Delete request", {
        ...cloudinarySafeLog(creds),
        publicId: body.publicId,
        resourceType,
      });
      await deleteCloudinaryAsset(body.publicId, resourceType);
    } else if (body.url) {
      await deleteCloudinaryByUrl(body.url, resourceType);
    } else {
      return NextResponse.json({ error: "publicId or url required" }, { status: 400 });
    }

    revalidateSiteContent();

    return NextResponse.json({
      success: true,
      publicId: body.publicId ?? publicIdFromUrl(body.url ?? ""),
    });
  } catch (error) {
    console.error("[Media] Delete failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
