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
  const site =
    env("HOTEL_WEBSITE") ||
    env("NEXT_PUBLIC_SITE_URL") ||
    env("SITE_URL") ||
    "https://hotel.theglobalorbit.com";
  const base = site.replace(/\/$/, "");
  return {
    name: env("HOTEL_NAME") || "Hotel Thamel Park",
    phone: env("HOTEL_PHONE") || "+977-1-4412345",
    email: env("HOTEL_EMAIL") || getMailFrom().address,
    address: env("HOTEL_ADDRESS") || "Thamel, Kathmandu 44600, Nepal",
    website: base,
    googleMap:
      env("HOTEL_GOOGLE_MAP") ||
      "https://maps.google.com/?q=Hotel+Thamel+Park+Kathmandu",
    whatsapp: env("HOTEL_WHATSAPP") || env("HOTEL_PHONE") || "+9779841234567",
    logoUrl: env("HOTEL_LOGO_URL") || `${base}/brand/thamelpark-logo.png`,
    heroImageUrl:
      env("HOTEL_EMAIL_HERO_URL") || `${base}/brand/og-logo.png`,
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
