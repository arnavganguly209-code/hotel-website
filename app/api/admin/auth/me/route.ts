import { NextResponse } from "next/server";
import { ensureAdminUser, getAdminSessionUser } from "@/lib/admin/auth";
import { db, isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ authenticated: false }, { status: 503 });
  }
  await ensureAdminUser();
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  const activeSessions = await db.adminSession.count({
    where: { userId: user.id, expiresAt: { gt: new Date() } },
  });

  return NextResponse.json({
    authenticated: true,
    user: {
      username: user.username,
      passwordChangedAt: user.passwordChangedAt,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      sessionStatus: activeSessions > 0 ? "active" : "none",
      activeSessions,
    },
  });
}
