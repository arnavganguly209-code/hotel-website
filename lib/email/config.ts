/**
 * Email / SMTP / hotel contact configuration — values from .env only.
 * Never hardcode credentials.
 */

function env(name: string, fallback = ""): string {
  return (process.env[name] || fallback).trim();
}

function envBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  return ["1", "true", "yes", "on"].includes(raw.trim().toLowerCase());
}

/** Canonical public origin that hosts this Next.js app (API + /brand assets). */
export function getPublicAppUrl(): string {
  const raw =
    env("NEXT_PUBLIC_SITE_URL") ||
    env("SITE_URL") ||
    env("HOTEL_APP_URL") ||
    // Prefer the live app host over a marketing domain that may not proxy /api.
    "https://hotel.theglobalorbit.com";
  return raw.replace(/\/+$/, "");
}

/** Public marketing / guest-facing website link (footer, Visit Website). */
export function getPublicWebsiteUrl(): string {
  const raw = env("HOTEL_WEBSITE") || getPublicAppUrl();
  return raw.replace(/\/+$/, "");
}

/** SMTP password: prefer SMTP_PASSWORD, fall back to legacy SMTP_PASS. */
export function getSmtpPassword(): string {
  return env("SMTP_PASSWORD") || env("SMTP_PASS");
}

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
};

export type HotelMailConfig = {
  name: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  googleMap: string;
  whatsapp: string;
  logoUrl: string;
  heroImageUrl: string;
  checkInTime: string;
  checkOutTime: string;
  smokingPolicy: string;
  cancellationPolicy: string;
  childrenPolicy: string;
  extraBedPolicy: string;
};

export type MailFromConfig = {
  name: string;
  address: string;
};

export function getSmtpConfig(): SmtpConfig | null {
  const host = env("SMTP_HOST");
  const user = env("SMTP_USER");
  const password = getSmtpPassword();
  if (!host || !user || !password) return null;

  const port = Number(env("SMTP_PORT", "587")) || 587;
  const secureExplicit = process.env.SMTP_SECURE;
  const secure =
    secureExplicit != null && secureExplicit !== ""
      ? envBool("SMTP_SECURE", port === 465)
      : port === 465;

  return { host, port, secure, user, password };
}

export function isSmtpConfigured(): boolean {
  return getSmtpConfig() != null;
}

export function getMailFrom(): MailFromConfig {
  const smtpFrom = env("SMTP_FROM");
  const angle = smtpFrom.match(/<([^>]+)>/);
  const address =
    env("MAIL_FROM_ADDRESS") ||
    (angle ? angle[1] : "") ||
    (smtpFrom.includes("@") && !smtpFrom.includes("<") ? smtpFrom : "") ||
    env("SMTP_USER") ||
    "booking@hotelthamelpark.com";
  const name = env("MAIL_FROM_NAME") || env("HOTEL_NAME") || "Hotel Thamel Park";
  return { name, address };
}

export function getMailFromHeader(): string {
  const { name, address } = getMailFrom();
  return `"${name.replace(/"/g, "")}" <${address}>`;
}

export function getHotelMailConfig(): HotelMailConfig {
  const appBase = getPublicAppUrl();
  const website = getPublicWebsiteUrl();
  // Absolute HTTPS URL only — never localhost. Served from the app host so email clients can load it.
  const logoPath = env("HOTEL_LOGO_PATH") || "/brand/email-logo.png";
  const logoAbsolute =
    env("HOTEL_LOGO_URL") ||
    `${appBase}${logoPath.startsWith("/") ? logoPath : `/${logoPath}`}?v=email-20260730c`;
  const heroAbsolute =
    env("HOTEL_EMAIL_HERO_URL") || `${appBase}/brand/og-image.png?v=email-20260730c`;

  return {
    name: env("HOTEL_NAME") || "Hotel Thamel Park",
    phone: env("HOTEL_PHONE") || "+977-1-4412345",
    email: env("HOTEL_EMAIL") || getMailFrom().address,
    address: env("HOTEL_ADDRESS") || "Thamel, Kathmandu 44600, Nepal",
    website,
    googleMap:
      env("HOTEL_GOOGLE_MAP") ||
      "https://maps.google.com/?q=Hotel+Thamel+Park+Kathmandu",
    whatsapp: env("HOTEL_WHATSAPP") || env("HOTEL_PHONE") || "+9779841234567",
    logoUrl: logoAbsolute,
    heroImageUrl: heroAbsolute,
    checkInTime: env("HOTEL_CHECKIN_TIME") || "14:00",
    checkOutTime: env("HOTEL_CHECKOUT_TIME") || "12:00",
    smokingPolicy:
      env("HOTEL_SMOKING_POLICY") ||
      "This is a non-smoking property. Smoking is permitted only in designated outdoor areas.",
    cancellationPolicy:
      env("HOTEL_CANCELLATION_POLICY") ||
      "Free cancellation up to 24 hours before check-in. Later cancellations may incur one night’s charge as per hotel policy.",
    childrenPolicy:
      env("HOTEL_CHILDREN_POLICY") ||
      "Children are welcome. Extra bedding and occupancy surcharges may apply according to room type.",
    extraBedPolicy:
      env("HOTEL_EXTRA_BED_POLICY") ||
      "Extra beds are subject to availability and may incur an additional charge.",
  };
}

/** Absolute guest PDF download URL (email-authenticated) — always on the app host. */
export function getBookingPdfUrl(bookingId: number, guestEmail: string): string {
  const base = getPublicAppUrl();
  return `${base}/api/bookings/${bookingId}/pdf?email=${encodeURIComponent(guestEmail)}&download=1`;
}

/** Absolute admin dashboard URL — always on the app host. */
export function getAdminDashboardUrl(): string {
  return `${getPublicAppUrl()}/admin`;
}

/** Hotel inbox for new-booking notifications — always prefer booking@ inbox. */
export function getBookingNotifyEmail(): string {
  return (
    env("BOOKING_NOTIFY_EMAIL") ||
    env("MAIL_FROM_ADDRESS") ||
    env("SMTP_USER") ||
    "booking@hotelthamelpark.com"
  );
}

export const EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: "booking_confirmation",
  BOOKING_PENDING: "booking_pending",
  BOOKING_CONFIRMED: "booking_confirmed",
  BOOKING_MODIFIED: "booking_modified",
  BOOKING_CANCELLED: "booking_cancelled",
  PAYMENT_RECEIVED: "payment_received",
  CHECKIN_REMINDER: "checkin_reminder",
  CHECKOUT_THANKYOU: "checkout_thankyou",
  REVIEW_REQUEST: "review_request",
  HOTEL_NEW_BOOKING: "hotel_new_booking",
  SMTP_VERIFY: "smtp_verify",
} as const;

export type EmailTemplateId = (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES];

export const SMTP_MAX_RETRIES = 3;
