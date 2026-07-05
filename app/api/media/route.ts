import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { isDatabaseAvailable, db } from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDatabaseAvailable()) {
    const files = await db.mediaFile.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ files });
  }

  return NextResponse.json({ files: [] });
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, url } = await request.json();
  if (isDatabaseAvailable() && id) {
    await db.mediaFile.delete({ where: { id } }).catch(() => null);
  }

  if (url && url.startsWith("/media/")) {
    const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    await fs.unlink(filePath).catch(() => null);
  }

  return NextResponse.json({ success: true });
}
