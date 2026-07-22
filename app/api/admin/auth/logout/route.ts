import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  clearAdminSessionCookie,
  revokeAdminSessionByToken,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 });
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) {
    await revokeAdminSessionByToken(token);
  }
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true });
}
