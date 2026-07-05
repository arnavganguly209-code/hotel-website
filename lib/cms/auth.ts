import { cookies } from "next/headers";

const SESSION_COOKIE = "orbit_session";

export function verifyPassword(password: string): boolean {
  const secureKey = process.env.ORBIT_ADMIN_PASSWORD;
  if (!secureKey) return false;
  return password === secureKey;
}

export async function setSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === "authenticated";
}
