#!/usr/bin/env node
/**
 * Build a gitignored Production PACO env fragment OUTSIDE the repo.
 * Never prints secret values. Does not write into the git working tree.
 *
 * Reads:
 *   --keys  merchant PEM/KEY directory
 *   --sdk   SecurityData.php (PACO public keys only)
 *   --api-key-file  file containing the Production API key (outside git)
 *   --out   output env fragment path (outside git)
 */
import fs from "node:fs";
import path from "node:path";
import { createPrivateKey, createPublicKey, createHash } from "node:crypto";

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : null;
}

function extractStaticString(source, name) {
  const re = new RegExp(`public\\s+static\\s+string\\s+\\$${name}\\s*=\\s*"([\\s\\S]*?)";`, "m");
  const m = source.match(re);
  if (!m) return null;
  return m[1].replace(/\s+/g, "");
}

function pemToBare(pem) {
  return pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
}

function findFile(dir, predicate) {
  const names = fs.readdirSync(dir);
  const hit = names.find(predicate);
  if (!hit) throw new Error(`Missing key file in ${dir}`);
  return path.join(dir, hit);
}

function fpPriv(bare) {
  const pem = `-----BEGIN RSA PRIVATE KEY-----\n${bare}\n-----END RSA PRIVATE KEY-----`;
  const priv = createPrivateKey(pem);
  const spki = createPublicKey(priv).export({ type: "spki", format: "der" });
  return {
    bits: priv.asymmetricKeyDetails?.modulusLength || null,
    fp: createHash("sha256").update(spki).digest("hex").slice(0, 16),
  };
}

function fpPub(bare) {
  const pem = `-----BEGIN PUBLIC KEY-----\n${bare}\n-----END PUBLIC KEY-----`;
  const pub = createPublicKey(pem);
  const spki = pub.export({ type: "spki", format: "der" });
  return {
    bits: pub.asymmetricKeyDetails?.modulusLength || null,
    fp: createHash("sha256").update(spki).digest("hex").slice(0, 16),
  };
}

const keyDir = arg("--keys") || "C:/Users/Admin/Desktop/hbl key";
const sdkPath =
  arg("--sdk") ||
  path.join(process.cwd(), "tmp/hbl/hbldemo/hbldemo/src/SecurityData.php");
const apiKeyFile = arg("--api-key-file") || path.join(keyDir, "paco-api-key.txt");
const outPath = arg("--out") || path.join(keyDir, "paco-production.env");

if (!fs.existsSync(keyDir)) {
  console.error("FAIL: merchant key directory not found");
  process.exit(1);
}
if (!fs.existsSync(sdkPath)) {
  console.error("FAIL: SecurityData.php not found");
  process.exit(1);
}
if (!fs.existsSync(apiKeyFile)) {
  console.error("FAIL: API key file not found (expected outside the repo)");
  process.exit(1);
}

const signPriv = pemToBare(
  fs.readFileSync(
    findFile(keyDir, (n) => /signing/i.test(n) && /private/i.test(n) && /\.key$/i.test(n)),
    "utf8"
  )
);
const encPriv = pemToBare(
  fs.readFileSync(
    findFile(keyDir, (n) => /encryption/i.test(n) && /private/i.test(n) && /\.key$/i.test(n)),
    "utf8"
  )
);
const sdk = fs.readFileSync(sdkPath, "utf8");
const pacoEnc = extractStaticString(sdk, "PacoEncryptionPublicKey");
const pacoSign = extractStaticString(sdk, "PacoSigningPublicKey");
if (!pacoEnc || !pacoSign) {
  console.error("FAIL: could not extract PACO public keys from SecurityData.php");
  process.exit(1);
}

const apiKey = fs.readFileSync(apiKeyFile, "utf8").trim();
if (!/^[a-f0-9]{32}$/i.test(apiKey)) {
  console.error("FAIL: API key file is not in the expected credential format");
  process.exit(1);
}

const signMeta = fpPriv(signPriv);
const encMeta = fpPriv(encPriv);
const pacoEncMeta = fpPub(pacoEnc);
const pacoSignMeta = fpPub(pacoSign);
if (signMeta.bits !== 4096 || encMeta.bits !== 4096) {
  console.error("FAIL: merchant private keys are not RSA-4096");
  process.exit(1);
}

const body = [
  "# --- HBL PACO (PRODUCTION) ---",
  "HBL_PACO_ENV=production",
  "HBL_PACO_OFFICE_ID=9104539176",
  `HBL_PACO_API_KEY=${apiKey}`,
  "HBL_PACO_ENCRYPTION_KEY_ID=19f84b5655f04e25a99b09f1ee2fac78",
  "HBL_PACO_BASE_URL=https://core.paco.2c2p.com/",
  "HBL_PACO_REQUEST_3DS=Y",
  "HBL_PACO_CURRENCY=USD",
  "BOOKING_CURRENCY=USD",
  `HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY=${signPriv}`,
  `HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY=${pacoEnc}`,
  `HBL_PACO_PACO_SIGNING_PUBLIC_KEY=${pacoSign}`,
  `HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY=${encPriv}`,
  "",
].join("\n");

fs.writeFileSync(outPath, body, { encoding: "utf8", mode: 0o600 });
try {
  fs.chmodSync(outPath, 0o600);
} catch {
  /* windows */
}

console.log(
  JSON.stringify(
    {
      outPath,
      officeId: "9104539176",
      env: "production",
      baseUrl: "https://core.paco.2c2p.com/",
      kid: "19f84b5655f04e25a99b09f1ee2fac78",
      request3ds: "Y",
      currency: "USD",
      apiKeyLength: apiKey.length,
      fingerprints: {
        merchantSigning: signMeta,
        merchantDecryption: encMeta,
        pacoEncryptionPublic: pacoEncMeta,
        pacoSigningPublic: pacoSignMeta,
      },
      wroteInsideGitRepo: path.resolve(outPath).startsWith(path.resolve(process.cwd()) + path.sep),
    },
    null,
    2
  )
);
