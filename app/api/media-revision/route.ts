import { NextResponse } from "next/server";
import { getContent } from "@/lib/cms/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Lightweight poll target for MediaLiveSync — Orbit mediaRevision only. */
export async function GET() {
  try {
    const content = await getContent();
    const mediaRevision = content.performanceSettings?.mediaRevision || "";
    return NextResponse.json(
      { mediaRevision },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { mediaRevision: "" },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
