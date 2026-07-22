import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  clearAdminSessionCookie,
  getAdminSessionUser,
  hashPassword,
  revokeAllAdminSessions,
  verifyPasswordHash,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin/auth";
import { db, isDatabaseAvailable } from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: false, error: "Service unavailable" }, { status: 503 });
    }
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 });
    }

    const sessionUser = await getAdminSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      oldPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    if (!body.oldPassword || !body.newPassword || !body.confirmPassword) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }
    if (body.newPassword !== body.confirmPassword) {
      return NextResponse.json({ success: false, error: "Passwords do not match" }, { status: 400 });
    }
    if (body.newPassword.length < 10) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 10 characters" },
        { status: 400 }
      );
    }

    const user = await db.adminUser.findUnique({ where: { id: sessionUser.id } });
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const ok = await verifyPasswordHash(body.oldPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.newPassword);
    await db.adminUser.update({
      where: { id: user.id },
      data: { passwordHash, passwordChangedAt: new Date(), failedAttempts: 0, lockedUntil: null },
    });

    await revokeAllAdminSessions(user.id);
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (token) {
      /* already revoked via revokeAll */
    }
    await clearAdminSessionCookie();

    return NextResponse.json({
      success: true,
      message: "Password updated. Please sign in again.",
    });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to update password" }, { status: 500 });
  }
}
