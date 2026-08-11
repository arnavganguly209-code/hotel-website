#!/usr/bin/env node
/**
 * Print a secret-safe PACO config summary from the current environment.
 * Never prints API keys or private key material.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash, createPrivateKey, createPublicKey } from "node:crypto";
import { config as loadEnv } from "dotenv";

const envPath = process.argv[2] || path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  loadEnv({ path: envPath });
}

function present(name) {
  const v = (process.env[name] || "").trim();
  return { set: Boolean(v), length: v.length };
}

function normalizePem(raw, kind) {
  let key = (raw || "").trim().replace(/\\n/g, "\n");
  if (key.includes("BEGIN")) return key;
  if (kind === "private") {
    return `-----BEGIN RSA PRIVATE KEY-----\n${key}\n-----END RSA PRIVATE KEY-----`;
  }
  return `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`;
}

function fpFromPrivate(raw) {
  try {
    const priv = createPrivateKey(normalizePem(raw, "private"));
    const spki = createPublicKey(priv).export({ type: "spki", format: "der" });
    const bits = priv.asymmetricKeyDetails?.modulusLength || null;
    return {
      bits,
      fingerprintPrefix: createHash("sha256").update(spki).digest("hex").slice(0, 16),
    };
  } catch {
    return { bits: null, fingerprintPrefix: null, parse: "FAIL" };
  }
}

function fpFromPublic(raw) {
  try {
    const pub = createPublicKey(normalizePem(raw, "public"));
    const spki = pub.export({ type: "spki", format: "der" });
    const bits = pub.asymmetricKeyDetails?.modulusLength || null;
    return {
      bits,
      fingerprintPrefix: createHash("sha256").update(spki).digest("hex").slice(0, 16),
    };
  } catch {
    return { bits: null, fingerprintPrefix: null, parse: "FAIL" };
  }
}

const env = (process.env.HBL_PACO_ENV || "").trim() || "(unset)";
const officeId = (process.env.HBL_PACO_OFFICE_ID || "").trim();
const baseUrl = (process.env.HBL_PACO_BASE_URL || "").trim();
const kid = (process.env.HBL_PACO_ENCRYPTION_KEY_ID || "").trim();
const tds = (process.env.HBL_PACO_REQUEST_3DS || "").trim() || "(default Y)";
const currency = (process.env.HBL_PACO_CURRENCY || "").trim() || "(default USD)";
const demoShape = Boolean((process.env.HBL_PACO_SDK_DEMO_SHAPE || "").trim());

const expected = {
  env: "production",
  officeId: "9104539176",
  baseUrl: "https://core.paco.2c2p.com/",
  kid: "19f84b5655f04e25a99b09f1ee2fac78",
  tds: "Y",
  currency: "USD",
};

const summary = {
  env,
  officeId,
  baseUrl,
  encryptionKeyId: kid,
  request3ds: tds,
  currency,
  sdkDemoShapeSet: demoShape,
  credentialsPresent: {
    apiKey: present("HBL_PACO_API_KEY").set,
    apiKeyLength: present("HBL_PACO_API_KEY").length,
    merchantSigningPrivate: present("HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY").set,
    merchantDecryptionPrivate: present("HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY").set,
    pacoEncryptionPublic: present("HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY").set,
    pacoSigningPublic: present("HBL_PACO_PACO_SIGNING_PUBLIC_KEY").set,
  },
  keyFingerprints: {
    merchantSigning: fpFromPrivate(process.env.HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY || ""),
    merchantDecryption: fpFromPrivate(process.env.HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY || ""),
    pacoEncryptionPublic: fpFromPublic(process.env.HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY || ""),
    pacoSigningPublic: fpFromPublic(process.env.HBL_PACO_PACO_SIGNING_PUBLIC_KEY || ""),
  },
  matchesProduction: {
    env: env === expected.env || env === "prod",
    officeId: officeId === expected.officeId,
    baseUrl: /^https:\/\/core\.paco\.2c2p\.com\/?$/.test(baseUrl),
    kid: kid === expected.kid,
    tds: tds === "Y" || tds === "(default Y)",
    currency: currency === "USD" || currency === "(default USD)",
    noUatMid: officeId !== "9104137120",
    noDemoEndpoint: !/demo-paco/i.test(baseUrl),
    noUatKid: kid !== "7664a2ed0dee4879bdfca0e8ce1ac313",
    noDemoShape: !demoShape,
  },
};

console.log(JSON.stringify(summary, null, 2));

const prod = summary.matchesProduction;
const ok =
  prod.env &&
  prod.officeId &&
  prod.baseUrl &&
  prod.kid &&
  prod.tds &&
  prod.currency &&
  prod.noUatMid &&
  prod.noDemoEndpoint &&
  prod.noUatKid &&
  prod.noDemoShape &&
  summary.credentialsPresent.apiKey &&
  summary.credentialsPresent.merchantSigningPrivate &&
  summary.credentialsPresent.merchantDecryptionPrivate &&
  summary.credentialsPresent.pacoEncryptionPublic &&
  summary.credentialsPresent.pacoSigningPublic &&
  summary.keyFingerprints.merchantSigning.bits === 4096 &&
  summary.keyFingerprints.merchantDecryption.bits === 4096;

if (process.argv.includes("--require-production") && !ok) {
  console.error("FAIL: environment is not a valid HBL PACO Production config");
  process.exit(1);
}
