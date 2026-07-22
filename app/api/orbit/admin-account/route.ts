import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { db, isDatabaseAvailable } from "@/lib/db";
import {
  ADMIN_USERNAME,
  assertSameOrigin,
  bootstrapPassword,
  ensureAdminUser,
  hashPassword,
  revokeAllAdminSessions,
  verifyPasswordHash,
} from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }

  const user = await ensureAdminUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Admin account unavailable" }, { status: 404 });
  }

  const [activeSessions, events] = await Promise.all([
    db.adminSession.count({ where: { userId: user.id, expiresAt: { gt: new Date() } } }),
    db.adminLoginEvent.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return NextResponse.json({
    success: true,
    account: {
      username: user.username,
      createdAt: user.createdAt,
      passwordChangedAt: user.passwordChangedAt,
      lastLoginAt: user.lastLoginAt,
      failedAttempts: user.failedAttempts,
      lockedUntil: user.lockedUntil,
      activeSessions,
    },
    events: events.map((e) => ({
      id: e.id,
      username: e.username,
      success: e.success,
      ip: e.ip,
      userAgent: e.userAgent,
      createdAt: e.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
    }
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 });
    }

    const body = (await req.json()) as {
      action?: "changePassword" | "reset";
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
      confirm?: boolean;
    };

    const user = await db.adminUser.findUnique({ where: { username: ADMIN_USERNAME } });
    if (!user) {
      return NextResponse.json({ success: false, error: "Admin account unavailable" }, { status: 404 });
    }

    if (body.action === "reset" || body.confirm === true) {
      const passwordHash = await hashPassword(bootstrapPassword());
      await db.adminUser.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
          failedAttempts: 0,
          lockedUntil: null,
        },
      });
      await revokeAllAdminSessions(user.id);
      return NextResponse.json({
        success: true,
        message: "Admin password has been reset to the default bootstrap password. All active admin sessions were signed out.",
      });
    }

    if (!body.currentPassword || !body.newPassword || !body.confirmPassword) {
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

    const valid = await verifyPasswordHash(body.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.newPassword);
    await db.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        failedAttempts: 0,
        lockedUntil: null,
      },
    });
    await revokeAllAdminSessions(user.id);

    return NextResponse.json({
      success: true,
      message: "Admin password updated. All active admin sessions were signed out.",
    });
  } catch (error) {
    console.error("[OrbitAdminAccount]", error);
    return NextResponse.json({ success: false, error: "Unable to update admin account" }, { status: 500 });
  }
}
