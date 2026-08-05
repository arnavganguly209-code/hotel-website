import type { PacoEnv } from "./types";

function required(name: string, value: string | undefined): string {
  const v = (value || "").trim();
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

function normalizePemKey(raw: string, kind: "private" | "public"): string {
  let key = raw.trim().replace(/\\n/g, "\n");
  if (key.includes("BEGIN")) return key;
  // PHP SDK stores bare base64 (PKCS#1 private / SPKI public)
  if (kind === "private") {
    return `-----BEGIN RSA PRIVATE KEY-----\n${key}\n-----END RSA PRIVATE KEY-----`;
  }
  return `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`;
}

export type PacoConfig = {
  env: PacoEnv;
  baseUrl: string;
  officeId: string;
  apiKey: string;
  encryptionKeyId: string;
  request3ds: "Y" | "N";
  currency: string;
  merchantSigningPrivateKey: string;
  pacoEncryptionPublicKey: string;
  pacoSigningPublicKey: string;
  merchantDecryptionPrivateKey: string;
  siteUrl: string;
};

export function isPacoConfigured(): boolean {
  return Boolean(
    process.env.HBL_PACO_OFFICE_ID?.trim() &&
      process.env.HBL_PACO_API_KEY?.trim() &&
      process.env.HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY?.trim() &&
      process.env.HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY?.trim() &&
      process.env.HBL_PACO_PACO_SIGNING_PUBLIC_KEY?.trim() &&
      process.env.HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY?.trim()
  );
}

export function getPacoConfig(): PacoConfig {
  const envRaw = (process.env.HBL_PACO_ENV || "uat").toLowerCase();
  const env: PacoEnv = envRaw === "production" || envRaw === "prod" ? "production" : "uat";

  const defaultBase =
    env === "production" ? "https://core.paco.2c2p.com/" : "https://core.demo-paco.2c2p.com/";
  const defaultKid =
    env === "production" ? "19f84b5655f04e25a99b09f1ee2fac78" : "7664a2ed0dee4879bdfca0e8ce1ac313";

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3002"
  ).replace(/\/$/, "");

  return {
    env,
    baseUrl: (process.env.HBL_PACO_BASE_URL || defaultBase).replace(/\/?$/, "/"),
    officeId: required("HBL_PACO_OFFICE_ID", process.env.HBL_PACO_OFFICE_ID),
    apiKey: required("HBL_PACO_API_KEY", process.env.HBL_PACO_API_KEY),
    encryptionKeyId: process.env.HBL_PACO_ENCRYPTION_KEY_ID?.trim() || defaultKid,
    request3ds: process.env.HBL_PACO_REQUEST_3DS === "N" ? "N" : "Y",
    currency: (process.env.HBL_PACO_CURRENCY || "USD").toUpperCase(),
    merchantSigningPrivateKey: normalizePemKey(
      required("HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY", process.env.HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY),
      "private"
    ),
    pacoEncryptionPublicKey: normalizePemKey(
      required("HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY", process.env.HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY),
      "public"
    ),
    pacoSigningPublicKey: normalizePemKey(
      required("HBL_PACO_PACO_SIGNING_PUBLIC_KEY", process.env.HBL_PACO_PACO_SIGNING_PUBLIC_KEY),
      "public"
    ),
    merchantDecryptionPrivateKey: normalizePemKey(
      required(
        "HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY",
        process.env.HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY
      ),
      "private"
    ),
    siteUrl,
  };
}

/** Official PACO JOSE constants from PHP SecurityData. */
export const PACO_JOSE = {
  tokenType: "JWT",
  jwsAlgorithm: "PS256",
  jweAlgorithm: "RSA-OAEP",
  jweEncryptionAlgorithm: "A128CBC-HS256",
  audience: "PacoAudience",
  responseIssuer: "PacoIssuer",
} as const;
