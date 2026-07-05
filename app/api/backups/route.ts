import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/cms/auth";
import { createBackup, listBackups, restoreBackup } from "@/lib/cms/store";

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

  const { action, id, label } = await request.json();

  if (action === "create") {
    await createBackup(label);
    return NextResponse.json({ success: true });
  }

  if (action === "restore" && id) {
    const ok = await restoreBackup(id);
    if (ok) revalidatePath("/", "layout");
    return NextResponse.json({ success: ok });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
