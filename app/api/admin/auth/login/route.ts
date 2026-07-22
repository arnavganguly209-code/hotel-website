import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import {
  ADMIN_USERNAME,
  assertNotLocked,
  assertSameOrigin,
  clientMeta,
  createAdminSession,
  ensureAdminUser,
  recordLoginEvent,
  registerFailedLogin,
  registerSuccessfulLogin,
  setAdminSessionCookie,
  verifyPasswordHash,
} from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: false, error: "Service unavailable" }, { status: 503 });
    }
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 });
    }

    const body = (await req.json()) as {
      username?: string;
      password?: string;
      remember?: boolean;
    };
    const username = (body.username || "").trim();
    const password = body.password || "";
    const { ip, userAgent } = clientMeta(req);

    const user = await ensureAdminUser();
    if (!user || username !== ADMIN_USERNAME) {
      await recordLoginEvent({ username, success: false, ip, userAgent });
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const lock = await assertNotLocked(user);
    if (!lock.ok) {
      await recordLoginEvent({ userId: user.id, username, success: false, ip, userAgent });
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPasswordHash(password, user.passwordHash);
    if (!valid) {
      await registerFailedLogin(user.id);
      await recordLoginEvent({ userId: user.id, username, success: false, ip, userAgent });
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    await registerSuccessfulLogin(user.id);
    const session = await createAdminSession({
      userId: user.id,
      remember: Boolean(body.remember),
      ip,
      userAgent,
    });
    await setAdminSessionCookie(session.token, session.expiresAt);
    await recordLoginEvent({ userId: user.id, username, success: true, ip, userAgent });

    return NextResponse.json({
      success: true,
      user: { username: user.username },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to sign in" }, { status: 500 });
  }
}
