import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import { deleteLocalUpload, toPublicId } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

    const target = (body.publicId || body.url || "").trim();
    if (!target) {
      return NextResponse.json({ error: "publicId or url required" }, { status: 400 });
    }

    const result = await deleteLocalUpload(target);

    revalidateSiteContent();

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      publicId: result.publicId ?? (body.publicId ? toPublicId(body.publicId) : null),
      storage: "local",
    });
  } catch (error) {
    console.error("[Media] Delete failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
