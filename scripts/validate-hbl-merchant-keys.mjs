#!/usr/bin/env node
/**
 * Validate merchant RSA-4096 key files without printing key material.
 * Usage:
 *   node scripts/validate-hbl-merchant-keys.mjs
 *   node scripts/validate-hbl-merchant-keys.mjs --dir "C:/Users/Admin/Desktop/hbl key"
 */
import {
  createPrivateKey,
  createPublicKey,
  publicEncrypt,
  privateDecrypt,
  createHash,
  constants,
} from "node:crypto";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { CompactSign, compactVerify } from "jose";

const args = process.argv.slice(2);
const dirFlag = args.indexOf("--dir");
const KEY_DIR =
  (dirFlag >= 0 ? args[dirFlag + 1] : null) ||
  "C:/Users/Admin/Desktop/hbl key";

function findFile(dir, predicate) {
  const names = existsSync(dir) ? readdirSync(dir) : [];
  const hit = names.find(predicate);
  return hit ? join(dir, hit) : null;
}

const FILES = {
  encPub: findFile(KEY_DIR, (n) => /encryption/i.test(n) && /public/i.test(n) && /\.pem$/i.test(n)),
  encPriv: findFile(KEY_DIR, (n) => /encryption/i.test(n) && /private/i.test(n) && /\.key$/i.test(n)),
  signPub: findFile(KEY_DIR, (n) => /signing/i.test(n) && /public/i.test(n) && /\.pem$/i.test(n)),
  signPriv: findFile(KEY_DIR, (n) => /signing/i.test(n) && /private/i.test(n) && /\.key$/i.test(n)),
};

function load(path) {
  return readFileSync(path, "utf8").trim() + "\n";
}

function pemMeta(pem) {
  const begin = (pem.match(/-----BEGIN ([^-]+)-----/) || [])[1] || null;
  const end = (pem.match(/-----END ([^-]+)-----/) || [])[1] || null;
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  return { begin, end, beginEndMatch: begin === end, base64Chars: b64.length };
}

function fingerprint(keyObj) {
  const spki = keyObj.export({ type: "spki", format: "der" });
  return createHash("sha256").update(spki).digest("hex").slice(0, 16);
}

function analyzePair(label, privPem, pubPem) {
  const out = {
    label,
    privBegin: pemMeta(privPem).begin,
    pubBegin: pemMeta(pubPem).begin,
    rsa4096: "FAIL",
    pairMatch: "FAIL",
    bits: null,
    type: null,
    pubFp: null,
    errors: [],
  };
  try {
    const priv = createPrivateKey(privPem);
    const pub = createPublicKey(pubPem);
    const details = priv.asymmetricKeyDetails || {};
    out.type = priv.asymmetricKeyType;
    out.bits = details.modulusLength || null;
    if (out.type === "rsa" && out.bits === 4096) out.rsa4096 = "PASS";
    out.pubFp = fingerprint(pub);
    if (fingerprint(createPublicKey(priv)) === out.pubFp) out.pairMatch = "PASS";
  } catch (err) {
    out.errors.push(err instanceof Error ? err.message : String(err));
  }
  return out;
}

function testEncryptDecrypt(encPubPem, encPrivPem) {
  const result = { rsaOaepSha1: "FAIL", errors: [] };
  const msg = Buffer.from("HTP-PACO-KEYCHECK-OK", "utf8");
  try {
    const c1 = publicEncrypt(
      { key: createPublicKey(encPubPem), padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha1" },
      msg
    );
    const p1 = privateDecrypt(
      { key: createPrivateKey(encPrivPem), padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha1" },
      c1
    );
    if (p1.equals(msg)) result.rsaOaepSha1 = "PASS";
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : String(err));
  }
  return result;
}

async function testPs256(signPrivPem, signPubPem) {
  const result = { ps256: "FAIL", errors: [] };
  try {
    const payload = new TextEncoder().encode(JSON.stringify({ t: "htp-ps256-check" }));
    const jws = await new CompactSign(payload)
      .setProtectedHeader({ alg: "PS256", typ: "JWT" })
      .sign(createPrivateKey(signPrivPem));
    const { payload: verified } = await compactVerify(jws, createPublicKey(signPubPem), {
      algorithms: ["PS256"],
    });
    if (new TextDecoder().decode(verified).includes("htp-ps256-check")) result.ps256 = "PASS";
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : String(err));
  }
  return result;
}

const missing = Object.entries(FILES).filter(([, p]) => !p);
if (missing.length) {
  console.error("FAIL: merchant key files not found in", KEY_DIR);
  console.error(
    "missing roles:",
    missing.map(([k]) => k).join(", ")
  );
  process.exit(1);
}

const encPub = load(FILES.encPub);
const encPriv = load(FILES.encPriv);
const signPub = load(FILES.signPub);
const signPriv = load(FILES.signPriv);

const encryption = analyzePair("encryption", encPriv, encPub);
const signing = analyzePair("signing", signPriv, signPub);
const encTest = testEncryptDecrypt(encPub, encPriv);
const signTest = await testPs256(signPriv, signPub);

const report = {
  keyDir: KEY_DIR,
  roles: {
    merchantSigningPrivate: "signs outbound JWS",
    merchantSigningPublic: "given to HBL to verify our signatures",
    merchantEncryptionPrivate: "decrypts PACO responses (HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY)",
    merchantEncryptionPublic: "given to HBL to encrypt responses",
  },
  ENCRYPTION: {
    "RSA 4096": encryption.rsa4096,
    "PKCS#1 private": encryption.privBegin === "RSA PRIVATE KEY" ? "PASS" : encryption.privBegin,
    "X.509 public": encryption.pubBegin === "PUBLIC KEY" ? "PASS" : encryption.pubBegin,
    pairMatch: encryption.pairMatch,
    "RSA-OAEP SHA-1 (PACO JOSE)": encTest.rsaOaepSha1,
    bits: encryption.bits,
    fingerprintPrefix: encryption.pubFp,
    errors: [...encryption.errors, ...encTest.errors],
  },
  SIGNING: {
    "RSA 4096": signing.rsa4096,
    "PKCS#1 private": signing.privBegin === "RSA PRIVATE KEY" ? "PASS" : signing.privBegin,
    "X.509 public": signing.pubBegin === "PUBLIC KEY" ? "PASS" : signing.pubBegin,
    pairMatch: signing.pairMatch,
    PS256: signTest.ps256,
    bits: signing.bits,
    fingerprintPrefix: signing.pubFp,
    errors: [...signing.errors, ...signTest.errors],
  },
  distinctPairs: encryption.pubFp && signing.pubFp && encryption.pubFp !== signing.pubFp ? "PASS" : "FAIL",
};

console.log(JSON.stringify(report, null, 2));

const failed =
  encryption.rsa4096 !== "PASS" ||
  signing.rsa4096 !== "PASS" ||
  encryption.pairMatch !== "PASS" ||
  signing.pairMatch !== "PASS" ||
  encTest.rsaOaepSha1 !== "PASS" ||
  signTest.ps256 !== "PASS" ||
  report.distinctPairs !== "PASS";

if (failed) {
  console.error("FAIL: merchant RSA key validation");
  process.exit(1);
}
console.log("\nMerchant RSA-4096 validation passed.");
