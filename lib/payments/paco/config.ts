import { createHash, createPublicKey } from "crypto";
import type { PacoEnv } from "./types";
import { syncPacoEnvFromDotenvFile } from "./load-env";

/** Confirmed HBL PACO Production identifiers (non-secret). Fingerprints are SHA-256 SPKI, 16 hex. */
export const PACO_PRODUCTION = {
  officeId: "9104539176",
  baseUrl: "https://core.paco.2c2p.com/",
  encryptionKeyId: "19f84b5655f04e25a99b09f1ee2fac78",
  request3ds: "Y" as const,
  currency: "USD",
  /** Downloads/SecurityData.php PacoEncryptionPublicKey */
  pacoEncryptionPublicFp: "4095797231f77a6d",
  /** Downloads/SecurityData.php PacoSigningPublicKey */
  pacoSigningPublicFp: "8789612338cccf3b",
} as const;

/** Confirmed HBL PACO UAT identifiers (non-secret). Never use these in Production. */
export const PACO_UAT = {
  officeId: "9104137120",
  baseUrl: "https://core.demo-paco.2c2p.com/",
  encryptionKeyId: "7664a2ed0dee4879bdfca0e8ce1ac313",
  /** tmp/hbl UAT SDK PacoEncryptionPublicKey — rejected in Production */
  pacoEncryptionPublicFp: "e5912edc7b1d9cce",
  /** tmp/hbl UAT SDK PacoSigningPublicKey — rejected in Production */
  pacoSigningPublicFp: "cbc81b358df61431",
} as const;

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

/** SHA-256 of SPKI DER, first 16 hex chars. Never logs key material. */
export function pacoPublicKeyFingerprint(pemOrBare: string): string {
  const pub = createPublicKey(normalizePemKey(pemOrBare, "public"));
  const der = pub.export({ type: "spki", format: "der" });
  return createHash("sha256").update(der).digest("hex").slice(0, 16);
}

function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/?$/, "/");
}

function isProdEndpoint(url: string): boolean {
  return /^https:\/\/core\.paco\.2c2p\.com\/$/i.test(url);
}

function isUatEndpoint(url: string): boolean {
  return /demo-paco/i.test(url);
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
  syncPacoEnvFromDotenvFile();
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
  syncPacoEnvFromDotenvFile();
  const envRaw = (process.env.HBL_PACO_ENV || "uat").toLowerCase();
  const env: PacoEnv = envRaw === "production" || envRaw === "prod" ? "production" : "uat";

  const defaultBase = env === "production" ? PACO_PRODUCTION.baseUrl : PACO_UAT.baseUrl;
  const defaultKid =
    env === "production" ? PACO_PRODUCTION.encryptionKeyId : PACO_UAT.encryptionKeyId;

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3002"
  ).replace(/\/$/, "");

  const officeId = required("HBL_PACO_OFFICE_ID", process.env.HBL_PACO_OFFICE_ID);
  const baseUrl = normalizeBaseUrl(process.env.HBL_PACO_BASE_URL || defaultBase);
  const encryptionKeyId = process.env.HBL_PACO_ENCRYPTION_KEY_ID?.trim() || defaultKid;
  const request3ds: "Y" | "N" = process.env.HBL_PACO_REQUEST_3DS === "N" ? "N" : "Y";
  const currency = (() => {
    const raw = (process.env.HBL_PACO_CURRENCY || "USD").trim().toUpperCase();
    if (raw === "USD" || raw === "NPR") return raw;
    throw new Error(`HBL_PACO_CURRENCY must be USD or NPR (got "${process.env.HBL_PACO_CURRENCY}")`);
  })();

  // Fail closed: never mix UAT and Production identifiers.
  if (env === "production") {
    if (!isProdEndpoint(baseUrl) || isUatEndpoint(baseUrl)) {
      throw new Error("HBL PACO Production requires https://core.paco.2c2p.com/ (UAT demo endpoint rejected)");
    }
    if (officeId === PACO_UAT.officeId) {
      throw new Error("HBL PACO Production rejected UAT merchant ID");
    }
    if (officeId !== PACO_PRODUCTION.officeId) {
      throw new Error("HBL PACO Production merchant ID mismatch");
    }
    if (encryptionKeyId === PACO_UAT.encryptionKeyId) {
      throw new Error("HBL PACO Production rejected UAT encryption kid");
    }
    if (encryptionKeyId !== PACO_PRODUCTION.encryptionKeyId) {
      throw new Error("HBL PACO Production encryption kid mismatch");
    }
    if (request3ds !== "Y") {
      throw new Error("HBL PACO Production requires request3dsFlag=Y");
    }
    if (currency !== "USD") {
      throw new Error("HBL PACO Production currency must be USD");
    }
    if (process.env.HBL_PACO_SDK_DEMO_SHAPE?.trim()) {
      throw new Error("HBL_PACO_SDK_DEMO_SHAPE must not be set in Production");
    }
  } else {
    if (officeId === PACO_PRODUCTION.officeId) {
      throw new Error("Production merchant ID cannot be used when HBL_PACO_ENV is not production");
    }
    if (isProdEndpoint(baseUrl)) {
      throw new Error("Production PACO endpoint cannot be used when HBL_PACO_ENV is not production");
    }
  }

  const merchantSigningPrivateKey = normalizePemKey(
    required("HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY", process.env.HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY),
    "private"
  );
  const pacoEncryptionPublicKey = normalizePemKey(
    required("HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY", process.env.HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY),
    "public"
  );
  const pacoSigningPublicKey = normalizePemKey(
    required("HBL_PACO_PACO_SIGNING_PUBLIC_KEY", process.env.HBL_PACO_PACO_SIGNING_PUBLIC_KEY),
    "public"
  );
  const merchantDecryptionPrivateKey = normalizePemKey(
    required(
      "HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY",
      process.env.HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY
    ),
    "private"
  );

  if (env === "production") {
    const encFp = pacoPublicKeyFingerprint(pacoEncryptionPublicKey);
    const signFp = pacoPublicKeyFingerprint(pacoSigningPublicKey);
    if (encFp === PACO_UAT.pacoEncryptionPublicFp || signFp === PACO_UAT.pacoSigningPublicFp) {
      throw new Error("HBL PACO Production rejected UAT PACO public keys");
    }
    if (encFp !== PACO_PRODUCTION.pacoEncryptionPublicFp) {
      throw new Error("HBL PACO Production PACO encryption public key mismatch");
    }
    if (signFp !== PACO_PRODUCTION.pacoSigningPublicFp) {
      throw new Error("HBL PACO Production PACO signing public key mismatch");
    }
  }

  return {
    env,
    baseUrl,
    officeId,
    apiKey: required("HBL_PACO_API_KEY", process.env.HBL_PACO_API_KEY),
    encryptionKeyId,
    request3ds,
    currency,
    merchantSigningPrivateKey,
    pacoEncryptionPublicKey,
    pacoSigningPublicKey,
    merchantDecryptionPrivateKey,
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
