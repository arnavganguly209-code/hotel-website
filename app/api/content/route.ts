import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { getContent, saveContent } from "@/lib/cms/store";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import type { SiteContent } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getContent();
  return NextResponse.json(content, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = (await request.json()) as SiteContent;
    await saveContent(content);
    revalidateSiteContent();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CMS] Save failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save content" },
      { status: 500 }
    );
  }
}
