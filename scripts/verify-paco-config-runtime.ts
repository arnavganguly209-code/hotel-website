/**
 * Runtime fail-closed tests for getPacoConfig (dummy keys only — no real secrets).
 */
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getPacoConfig, PACO_PRODUCTION, PACO_UAT } from "../lib/payments/paco/config";
import { parseInquiryOutcome } from "../lib/payments/paco/client";
import { resetPacoEnvSyncCache, syncPacoEnvFromDotenvFile } from "../lib/payments/paco/load-env";

function pemBody(pem: string): string {
  return pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
}

function dummyKeys() {
  const sign = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const enc = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pacoEnc = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pacoSign = generateKeyPairSync("rsa", { modulusLength: 2048 });
  return {
    HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY: pemBody(
      sign.privateKey.export({ type: "pkcs1", format: "pem" }).toString()
    ),
    HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY: pemBody(
      enc.privateKey.export({ type: "pkcs1", format: "pem" }).toString()
    ),
    HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY: pemBody(
      pacoEnc.publicKey.export({ type: "spki", format: "pem" }).toString()
    ),
    HBL_PACO_PACO_SIGNING_PUBLIC_KEY: pemBody(
      pacoSign.publicKey.export({ type: "spki", format: "pem" }).toString()
    ),
    HBL_PACO_API_KEY: "unit-test-api-key-not-production",
  };
}

const keys = dummyKeys();
const saved = { ...process.env };

function resetEnv(overrides: Record<string, string | undefined>) {
  process.env.PACO_SKIP_DOTENV_SYNC = "1";
  for (const k of Object.keys(process.env)) {
    if (k.startsWith("HBL_PACO_")) delete process.env[k];
  }
  Object.assign(process.env, keys, overrides);
}

function expectThrow(label: string, overrides: Record<string, string | undefined>, match: RegExp) {
  resetEnv(overrides);
  assert.throws(() => getPacoConfig(), match, label);
  console.log("OK:", label);
}

assert.equal(PACO_PRODUCTION.officeId, "9104539176");
assert.equal(PACO_PRODUCTION.baseUrl, "https://core.paco.2c2p.com/");
assert.equal(PACO_PRODUCTION.encryptionKeyId, "19f84b5655f04e25a99b09f1ee2fac78");
assert.equal(PACO_PRODUCTION.request3ds, "Y");
assert.equal(PACO_PRODUCTION.currency, "USD");
assert.equal(PACO_UAT.officeId, "9104137120");
assert.equal(PACO_UAT.baseUrl, "https://core.demo-paco.2c2p.com/");
console.log("OK: PACO_PRODUCTION / PACO_UAT constants");

resetEnv({
  HBL_PACO_ENV: "production",
  HBL_PACO_OFFICE_ID: PACO_PRODUCTION.officeId,
  HBL_PACO_BASE_URL: PACO_PRODUCTION.baseUrl,
  HBL_PACO_ENCRYPTION_KEY_ID: PACO_PRODUCTION.encryptionKeyId,
  HBL_PACO_REQUEST_3DS: "Y",
  HBL_PACO_CURRENCY: "USD",
});
const prod = getPacoConfig();
assert.equal(prod.env, "production");
assert.equal(prod.officeId, PACO_PRODUCTION.officeId);
assert.equal(prod.baseUrl, PACO_PRODUCTION.baseUrl);
assert.equal(prod.encryptionKeyId, PACO_PRODUCTION.encryptionKeyId);
assert.equal(prod.request3ds, "Y");
assert.equal(prod.currency, "USD");
console.log("OK: production config accepts confirmed HBL identifiers");

expectThrow(
  "production rejects UAT MID",
  {
    HBL_PACO_ENV: "production",
    HBL_PACO_OFFICE_ID: PACO_UAT.officeId,
    HBL_PACO_BASE_URL: PACO_PRODUCTION.baseUrl,
    HBL_PACO_ENCRYPTION_KEY_ID: PACO_PRODUCTION.encryptionKeyId,
  },
  /UAT merchant ID/
);

expectThrow(
  "production rejects demo-paco endpoint",
  {
    HBL_PACO_ENV: "production",
    HBL_PACO_OFFICE_ID: PACO_PRODUCTION.officeId,
    HBL_PACO_BASE_URL: PACO_UAT.baseUrl,
    HBL_PACO_ENCRYPTION_KEY_ID: PACO_PRODUCTION.encryptionKeyId,
  },
  /demo endpoint|UAT/
);

expectThrow(
  "production rejects UAT kid",
  {
    HBL_PACO_ENV: "production",
    HBL_PACO_OFFICE_ID: PACO_PRODUCTION.officeId,
    HBL_PACO_BASE_URL: PACO_PRODUCTION.baseUrl,
    HBL_PACO_ENCRYPTION_KEY_ID: PACO_UAT.encryptionKeyId,
  },
  /UAT encryption kid/
);

expectThrow(
  "production rejects 3DS N",
  {
    HBL_PACO_ENV: "production",
    HBL_PACO_OFFICE_ID: PACO_PRODUCTION.officeId,
    HBL_PACO_BASE_URL: PACO_PRODUCTION.baseUrl,
    HBL_PACO_ENCRYPTION_KEY_ID: PACO_PRODUCTION.encryptionKeyId,
    HBL_PACO_REQUEST_3DS: "N",
  },
  /request3dsFlag=Y/
);

expectThrow(
  "production rejects NPR currency",
  {
    HBL_PACO_ENV: "production",
    HBL_PACO_OFFICE_ID: PACO_PRODUCTION.officeId,
    HBL_PACO_BASE_URL: PACO_PRODUCTION.baseUrl,
    HBL_PACO_ENCRYPTION_KEY_ID: PACO_PRODUCTION.encryptionKeyId,
    HBL_PACO_CURRENCY: "NPR",
  },
  /currency must be USD/
);

expectThrow(
  "production rejects SDK demo shape env",
  {
    HBL_PACO_ENV: "production",
    HBL_PACO_OFFICE_ID: PACO_PRODUCTION.officeId,
    HBL_PACO_BASE_URL: PACO_PRODUCTION.baseUrl,
    HBL_PACO_ENCRYPTION_KEY_ID: PACO_PRODUCTION.encryptionKeyId,
    HBL_PACO_SDK_DEMO_SHAPE: "1",
  },
  /SDK_DEMO_SHAPE/
);

expectThrow(
  "uat rejects production MID",
  {
    HBL_PACO_ENV: "uat",
    HBL_PACO_OFFICE_ID: PACO_PRODUCTION.officeId,
    HBL_PACO_BASE_URL: PACO_UAT.baseUrl,
    HBL_PACO_ENCRYPTION_KEY_ID: PACO_UAT.encryptionKeyId,
  },
  /Production merchant ID/
);

expectThrow(
  "uat rejects production endpoint",
  {
    HBL_PACO_ENV: "uat",
    HBL_PACO_OFFICE_ID: PACO_UAT.officeId,
    HBL_PACO_BASE_URL: PACO_PRODUCTION.baseUrl,
    HBL_PACO_ENCRYPTION_KEY_ID: PACO_UAT.encryptionKeyId,
  },
  /Production PACO endpoint/
);

resetEnv({
  HBL_PACO_ENV: "uat",
  HBL_PACO_OFFICE_ID: PACO_UAT.officeId,
  HBL_PACO_BASE_URL: PACO_UAT.baseUrl,
  HBL_PACO_ENCRYPTION_KEY_ID: PACO_UAT.encryptionKeyId,
  HBL_PACO_REQUEST_3DS: "Y",
  HBL_PACO_CURRENCY: "USD",
});
const uat = getPacoConfig();
assert.equal(uat.env, "uat");
assert.equal(uat.officeId, PACO_UAT.officeId);
console.log("OK: UAT config remains available when explicitly separated");

const failed = parseInquiryOutcome({
  response: {
    Data: {
      transactionList: [
        {
          officeId: PACO_PRODUCTION.officeId,
          PaymentStatusInfo: { PaymentStatus: "F", PaymentStep: "PR" },
          TransactionAmount: { Amount: 60, CurrencyCode: "USD" },
        },
      ],
    },
  },
});
assert.equal(failed.paid, false);
assert.equal(failed.failed, true);
assert.equal(failed.statusText, "PR");
assert.equal(failed.officeId, PACO_PRODUCTION.officeId);
console.log("OK: PACO F/PR inquiry does not become paid");

const approved = parseInquiryOutcome({
  response: {
    Data: {
      transactionList: [
        {
          officeId: PACO_PRODUCTION.officeId,
          PaymentStatusInfo: { PaymentStatus: "A", PaymentStep: "AA" },
          TransactionAmount: { Amount: 60, CurrencyCode: "USD" },
        },
      ],
    },
  },
});
assert.equal(approved.paid, true);
assert.equal(approved.failed, false);
console.log("OK: PACO A inquiry is eligible for paid (subject to money/MID match)");

{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "paco-env-"));
  fs.writeFileSync(
    path.join(dir, ".env"),
    [
      "HBL_PACO_ENV=production",
      "HBL_PACO_OFFICE_ID=9104539176",
      "HBL_PACO_BASE_URL=https://core.paco.2c2p.com/",
      "HBL_PACO_ENCRYPTION_KEY_ID=19f84b5655f04e25a99b09f1ee2fac78",
      "HBL_PACO_REQUEST_3DS=Y",
      "HBL_PACO_CURRENCY=USD",
    ].join("\n")
  );
  delete process.env.PACO_SKIP_DOTENV_SYNC;
  resetPacoEnvSyncCache();
  process.env.HBL_PACO_ENV = "uat";
  process.env.HBL_PACO_OFFICE_ID = PACO_UAT.officeId;
  process.env.HBL_PACO_BASE_URL = PACO_UAT.baseUrl;
  process.env.HBL_PACO_ENCRYPTION_KEY_ID = PACO_UAT.encryptionKeyId;
  process.env.HBL_PACO_SDK_DEMO_SHAPE = "1";
  syncPacoEnvFromDotenvFile(dir);
  assert.equal(process.env.HBL_PACO_ENV, "production");
  assert.equal(process.env.HBL_PACO_OFFICE_ID, PACO_PRODUCTION.officeId);
  assert.equal(process.env.HBL_PACO_BASE_URL, PACO_PRODUCTION.baseUrl);
  assert.equal(process.env.HBL_PACO_ENCRYPTION_KEY_ID, PACO_PRODUCTION.encryptionKeyId);
  assert.equal(process.env.HBL_PACO_SDK_DEMO_SHAPE, undefined);
  console.log("OK: .env file overrides stale UAT process env");

  fs.writeFileSync(
    path.join(dir, ".env"),
    [
      "HBL_PACO_ENV=uat",
      "HBL_PACO_OFFICE_ID=9104137120",
      "HBL_PACO_BASE_URL=https://core.demo-paco.2c2p.com/",
      "HBL_PACO_ENCRYPTION_KEY_ID=7664a2ed0dee4879bdfca0e8ce1ac313",
      "HBL_PACO_REQUEST_3DS=Y",
      "HBL_PACO_CURRENCY=USD",
    ].join("\n")
  );
  resetPacoEnvSyncCache();
  process.env.HBL_PACO_ENV = "production";
  process.env.HBL_PACO_OFFICE_ID = PACO_PRODUCTION.officeId;
  syncPacoEnvFromDotenvFile(dir);
  assert.equal(process.env.HBL_PACO_ENV, "uat");
  assert.equal(process.env.HBL_PACO_OFFICE_ID, PACO_UAT.officeId);
  console.log("OK: UAT .env remains authoritative when HBL_PACO_ENV=uat");
  process.env.PACO_SKIP_DOTENV_SYNC = "1";
  fs.rmSync(dir, { recursive: true, force: true });
}

process.env = saved;
console.log("\nProduction config runtime checks passed.");
