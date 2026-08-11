/**
 * Tests for non-2xx PACO body diagnosis. Dummy keys only. Does not call PACO.
 */
import assert from "node:assert/strict";
import { generateKeyPairSync, type KeyObject } from "node:crypto";
import { CompactEncrypt, CompactSign } from "jose";
import { PACO_JOSE, type PacoConfig } from "../lib/payments/paco/config";
import { decryptToken } from "../lib/payments/paco/jose";
import {
  detectPacoBodyFormat,
  diagnosePacoHttpError,
  pacoHttpDiagnosticLogFields,
  PacoHttpError,
} from "../lib/payments/paco/http-error";

function pem(key: KeyObject, type: "pkcs1" | "spki"): string {
  return key.export({ type, format: "pem" }).toString();
}

type TestConfig = PacoConfig & { _pacoSignKey: import("crypto").KeyObject };

function dummyConfig(): TestConfig {
  const merchantEnc = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pacoSign = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const merchantSign = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pacoEnc = generateKeyPairSync("rsa", { modulusLength: 2048 });
  return {
    env: "production",
    baseUrl: "https://core.paco.2c2p.com/",
    officeId: "9104539176",
    apiKey: "unit-test-api-key-not-production",
    encryptionKeyId: "19f84b5655f04e25a99b09f1ee2fac78",
    request3ds: "Y",
    currency: "USD",
    merchantSigningPrivateKey: pem(merchantSign.privateKey, "pkcs1"),
    pacoEncryptionPublicKey: pem(pacoEnc.publicKey, "spki"),
    pacoSigningPublicKey: pem(pacoSign.publicKey, "spki"),
    merchantDecryptionPrivateKey: pem(merchantEnc.privateKey, "pkcs1"),
    siteUrl: "https://example.test",
    _pacoSignKey: pacoSign.privateKey,
  };
}

const enc = new TextEncoder();

async function encryptPacoResponse(payload: object, config: TestConfig) {
  const { createPublicKey, createPrivateKey } = await import("node:crypto");
  const encryptPub = createPublicKey(createPrivateKey(config.merchantDecryptionPrivateKey));
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iss: PACO_JOSE.responseIssuer,
    aud: config.apiKey,
    iat: now,
    nbf: now,
    exp: now + 3600,
  };
  const jws = await new CompactSign(enc.encode(JSON.stringify(claims)))
    .setProtectedHeader({ alg: PACO_JOSE.jwsAlgorithm, typ: PACO_JOSE.tokenType })
    .sign(config._pacoSignKey);
  return new CompactEncrypt(enc.encode(jws))
    .setProtectedHeader({
      alg: PACO_JOSE.jweAlgorithm,
      enc: PACO_JOSE.jweEncryptionAlgorithm,
      kid: config.encryptionKeyId,
      typ: PACO_JOSE.tokenType,
    })
    .encrypt(encryptPub);
}

async function main() {
assert.equal(detectPacoBodyFormat(""), "empty");
assert.equal(detectPacoBodyFormat('{"responseCode":"X"}'), "json");
assert.equal(detectPacoBodyFormat("<html><title>Bad</title></html>"), "html");
assert.equal(detectPacoBodyFormat("Bad Request"), "text");
console.log("OK: body format detection");

{
  const config = dummyConfig();
  const d = await diagnosePacoHttpError(
    400,
    JSON.stringify({
      response: {
        apiResponse: {
          responseCode: "PC-B050002",
          responseDescription: "Invalid request",
          version: "1.0",
        },
        orderNo: "1786433405355",
      },
    }),
    config
  );
  assert.equal(d.bodyFormat, "json");
  assert.equal(d.responseCode, "PC-B050002");
  assert.equal(d.responseDescription, "Invalid request");
  assert.equal(d.orderNo, "1786433405355");
  assert.equal(d.version, "1.0");
  assert.equal(d.decrypted, null);
  const log = pacoHttpDiagnosticLogFields(d);
  assert.equal(log.responseCode, "PC-B050002");
  assert.ok(!JSON.stringify(log).includes("BEGIN"));
  console.log("OK: JSON 400 extracts responseCode/description");
}

{
  const config = dummyConfig();
  const d = await diagnosePacoHttpError(400, "<html><head><title>400 Bad Request</title></head><body>Forbidden</body></html>", config);
  assert.equal(d.bodyFormat, "html");
  assert.equal(d.message, "400 Bad Request");
  assert.equal(d.responseCode, null);
  console.log("OK: HTML 400 extracts safe title");
}

{
  const config = dummyConfig();
  const jwe = await encryptPacoResponse(
    {
      response: {
        responseCode: "PC-B050003",
        responseDescription: "Merchant configuration error",
      },
      orderNo: "1786433405355",
    },
    config
  );
  assert.equal(detectPacoBodyFormat(jwe), "jwe");
  const roundTrip = await decryptToken(jwe, config);
  assert.match(roundTrip, /PC-B050003/);
  const d = await diagnosePacoHttpError(400, jwe, config);
  assert.equal(d.bodyFormat, "jwe");
  assert.equal(d.decrypted, true);
  assert.equal(d.signatureVerified, true);
  assert.equal(d.claimsOk, true);
  assert.equal(d.responseCode, "PC-B050003");
  assert.equal(d.responseDescription, "Merchant configuration error");
  assert.equal(d.orderNo, "1786433405355");
  const err = new PacoHttpError(d);
  assert.match(err.message, /PACO HTTP 400/);
  assert.match(err.message, /PC-B050003/);
  assert.doesNotMatch(err.message, /eyJ/);
  console.log("OK: JOSE 400 decrypts with PS256 / RSA-OAEP / A128CBC-HS256 and extracts fields");
}

{
  const config = dummyConfig();
  const d = await diagnosePacoHttpError(400, "a.b.c.d.e", config);
  assert.equal(d.bodyFormat, "jwe");
  assert.equal(d.decrypted, false);
  assert.equal(d.signatureVerified, false);
  console.log("OK: invalid JWE reports decrypt failure without throwing");
}

console.log("\nPACO HTTP error diagnosis checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
