import { NextResponse } from "next/server";
import { getContent, saveContent } from "@/lib/cms/store";
import { isAuthenticated } from "@/lib/cms/auth";
import type { SiteContent } from "@/lib/cms/types";

export async function GET() {
  const content = await getContent();
  return NextResponse.json(content);
}

export async function PUT(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as SiteContent;
    await saveContent(body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
