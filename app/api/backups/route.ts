import { NextResponse } from "next/server";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import { isAuthenticated } from "@/lib/cms/auth";
import { createBackup, listBackups, restoreBackup } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const backups = await listBackups();
  return NextResponse.json({ backups });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const action = body.action as string;

  if (action === "create") {
    await createBackup(body.label);
    return NextResponse.json({ success: true });
  }

  if (action === "restore") {
    const ok = await restoreBackup(body.id);
    if (ok) revalidateSiteContent();
    return NextResponse.json({ success: ok });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
