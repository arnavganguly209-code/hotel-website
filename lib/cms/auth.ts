import { cookies } from "next/headers";

const SESSION_COOKIE = "orbit_session";

/**
 * Secure cookies when the site is served over HTTPS.
 * HTTP VPS testing: leave SITE_URL / NEXT_PUBLIC_SITE_URL as http://... or set COOKIE_SECURE=false.
 * After TLS (Nginx): use https://... or set COOKIE_SECURE=true / TRUST_PROXY_HTTPS=true.
 */
export function shouldUseSecureCookies(): boolean {
  const explicit = process.env.COOKIE_SECURE?.trim().toLowerCase();
  if (explicit === "true" || explicit === "1" || explicit === "yes") return true;
  if (explicit === "false" || explicit === "0" || explicit === "no") return false;

  if (process.env.TRUST_PROXY_HTTPS?.trim().toLowerCase() === "true") return true;

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    ""
  ).trim();
  if (siteUrl.startsWith("https://")) return true;
  if (siteUrl.startsWith("http://")) return false;

  // Default: allow HTTP login during VPS setup/testing.
  return false;
}

export function verifyPassword(password: string): boolean {
  const secureKey = process.env.ORBIT_ADMIN_PASSWORD;
  if (!secureKey) return false;
  return password === secureKey;
}

export async function setSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
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
