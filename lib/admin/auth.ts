import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db, isDatabaseAvailable } from "@/lib/db";
import { shouldUseSecureCookies } from "@/lib/cms/auth";

export const ADMIN_USERNAME = "thamelpark";
export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_HOURS = 8;
const REMEMBER_HOURS = 24 * 14;
const MAX_FAILED = 8;
const LOCK_MINUTES = 30;
const BCRYPT_ROUNDS = 12;

function getSessionSecret(): Uint8Array {
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ORBIT_ADMIN_PASSWORD?.trim() ||
    "dev-admin-session-secret-change-me";
  return new TextEncoder().encode(secret);
}

function bootstrapPassword(): string {
  return (
    process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim() ||
    "@hotelthamelpark01#"
  );
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPasswordHash(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

/** Ensure the fixed admin user exists (server-only bootstrap). */
export async function ensureAdminUser() {
  if (!isDatabaseAvailable()) return null;
  try {
    const existing = await db.adminUser.findUnique({
      where: { username: ADMIN_USERNAME },
    });
    if (existing) return existing;

    const passwordHash = await hashPassword(bootstrapPassword());
    return db.adminUser.create({
      data: {
        username: ADMIN_USERNAME,
        passwordHash,
      },
    });
  } catch (error) {
    console.error("[admin] ensureAdminUser failed:", error);
    return null;
  }
}

export async function createAdminSession(options: {
  userId: string;
  remember?: boolean;
  ip?: string;
  userAgent?: string;
}): Promise<{ token: string; expiresAt: Date }> {
  const hours = options.remember ? REMEMBER_HOURS : SESSION_HOURS;
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  await db.adminSession.create({
    data: {
      tokenHash,
      userId: options.userId,
      expiresAt,
      ip: options.ip || "",
      userAgent: (options.userAgent || "").slice(0, 500),
    },
  });

  const jwt = await new SignJWT({ sid: tokenHash, uid: options.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSessionSecret());

  return { token: jwt, expiresAt };
}

export async function setAdminSessionCookie(
  token: string,
  expiresAt: Date
): Promise<void> {
  const cookieStore = await cookies();
  const maxAge = Math.max(60, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function revokeAdminSessionByToken(token: string): Promise<void> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const sid = typeof payload.sid === "string" ? payload.sid : "";
    if (sid) {
      await db.adminSession.deleteMany({ where: { tokenHash: sid } });
    }
  } catch {
    /* ignore invalid token */
  }
}

export async function revokeAllAdminSessions(userId: string): Promise<void> {
  await db.adminSession.deleteMany({ where: { userId } });
}

export type AdminSessionUser = {
  id: string;
  username: string;
  passwordChangedAt: Date;
  createdAt: Date;
  lastLoginAt: Date | null;
};

export async function getAdminSessionUser(): Promise<AdminSessionUser | null> {
  if (!isDatabaseAvailable()) return null;
  await ensureAdminUser();

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const sid = typeof payload.sid === "string" ? payload.sid : "";
    const uid = typeof payload.uid === "string" ? payload.uid : "";
    if (!sid || !uid) return null;

    const session = await db.adminSession.findUnique({ where: { tokenHash: sid } });
    if (!session || session.userId !== uid || session.expiresAt < new Date()) {
      if (session) {
        await db.adminSession.delete({ where: { id: session.id } }).catch(() => null);
      }
      return null;
    }

    const user = await db.adminUser.findUnique({ where: { id: uid } });
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      passwordChangedAt: user.passwordChangedAt,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<AdminSessionUser> {
  const user = await getAdminSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export function clientMeta(req: Request): { ip: string; userAgent: string } {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    (forwarded ? forwarded.split(",")[0]?.trim() : "") ||
    req.headers.get("x-real-ip") ||
    "";
  const userAgent = req.headers.get("user-agent") || "";
  return { ip, userAgent };
}

export async function recordLoginEvent(data: {
  userId?: string | null;
  username: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
}) {
  if (!isDatabaseAvailable()) return;
  await db.adminLoginEvent.create({
    data: {
      userId: data.userId || null,
      username: data.username,
      success: data.success,
      ip: data.ip || "",
      userAgent: (data.userAgent || "").slice(0, 500),
    },
  });
}

export async function assertNotLocked(user: {
  failedAttempts: number;
  lockedUntil: Date | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false, message: "Invalid credentials" };
  }
  return { ok: true };
}

export async function registerFailedLogin(userId: string) {
  const user = await db.adminUser.findUnique({ where: { id: userId } });
  if (!user) return;
  const failedAttempts = user.failedAttempts + 1;
  const lockedUntil =
    failedAttempts >= MAX_FAILED
      ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
      : null;
  await db.adminUser.update({
    where: { id: userId },
    data: {
      failedAttempts,
      lockedUntil,
    },
  });
}

export async function registerSuccessfulLogin(userId: string) {
  await db.adminUser.update({
    where: { id: userId },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });
}

export function assertSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host");
  if (!host) return true;
  try {
    const o = new URL(origin);
    return o.host === host;
  } catch {
    return false;
  }
}

export { bootstrapPassword };
