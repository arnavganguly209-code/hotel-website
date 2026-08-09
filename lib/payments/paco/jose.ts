import {
  createPrivateKey,
  createPublicKey,
  randomUUID,
  type KeyObject,
} from "crypto";
import {
  CompactEncrypt,
  CompactSign,
  compactDecrypt,
  compactVerify,
} from "jose";
import { formatPacoAmountFields } from "./currency";
import { PACO_JOSE, type PacoConfig } from "./config";
import type { PacoJoseEnvelope } from "./types";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function importPrivateKey(pem: string): KeyObject {
  return createPrivateKey(pem);
}

function importPublicKey(pem: string): KeyObject {
  return createPublicKey(pem);
}

/** Matches PHP ActionRequest::Guid() (lowercase UUID). */
export function pacoGuid(): string {
  return randomUUID().toLowerCase();
}

/** UTC timestamp like PHP Carbon: Y-m-d\TH:i:s.v\Z */
export function pacoRequestDateTime(date = new Date()): string {
  const iso = date.toISOString();
  // Ensure millisecond precision (3 digits)
  return iso.replace(/(\.\d{3})\d*Z$/, "$1Z");
}

/** Millisecond-precision order number like Carbon::getPreciseTimestamp(3). */
export function pacoOrderNo(date = new Date()): string {
  return String(date.getTime());
}

/**
 * Encrypt + sign payload exactly like PHP ActionRequest::EncryptPayload:
 * 1) JWS compact (PS256, typ JWT)
 * 2) JWE compact wrapping that JWS (RSA-OAEP / A128CBC-HS256, kid, typ JWT)
 */
export async function encryptPayload(
  payloadJson: string,
  config: PacoConfig
): Promise<string> {
  const signingKey = importPrivateKey(config.merchantSigningPrivateKey);
  const encryptingKey = importPublicKey(config.pacoEncryptionPublicKey);

  const jws = await new CompactSign(textEncoder.encode(payloadJson))
    .setProtectedHeader({
      alg: PACO_JOSE.jwsAlgorithm,
      typ: PACO_JOSE.tokenType,
    })
    .sign(signingKey);

  return new CompactEncrypt(textEncoder.encode(jws))
    .setProtectedHeader({
      alg: PACO_JOSE.jweAlgorithm,
      enc: PACO_JOSE.jweEncryptionAlgorithm,
      kid: config.encryptionKeyId,
      typ: PACO_JOSE.tokenType,
    })
    .encrypt(encryptingKey);
}

/**
 * Decrypt + verify response like PHP ActionRequest::DecryptToken:
 * JWE decrypt → JWS verify → claim checks (nbf, exp, aud=apiKey, iss=PacoIssuer)
 */
export async function decryptToken(token: string, config: PacoConfig): Promise<string> {
  const decryptingKey = importPrivateKey(config.merchantDecryptionPrivateKey);
  const signatureVerificationKey = importPublicKey(config.pacoSigningPublicKey);

  const { plaintext } = await compactDecrypt(token.trim(), decryptingKey);
  const jwsCompact = textDecoder.decode(plaintext);

  const { payload } = await compactVerify(jwsCompact, signatureVerificationKey, {
    algorithms: [PACO_JOSE.jwsAlgorithm],
  });

  const claimsJson = textDecoder.decode(payload);
  const claims = JSON.parse(claimsJson) as Record<string, unknown>;

  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.nbf === "number" && claims.nbf > now + 60) {
    throw new Error("PACO response nbf claim is in the future");
  }
  if (typeof claims.exp === "number" && claims.exp < now - 60) {
    throw new Error("PACO response token has expired");
  }
  if (claims.aud !== config.apiKey) {
    throw new Error("PACO response audience mismatch");
  }
  if (claims.iss !== PACO_JOSE.responseIssuer) {
    throw new Error("PACO response issuer mismatch");
  }

  return claimsJson;
}

export function buildJoseEnvelope(
  request: unknown,
  config: PacoConfig,
  now = new Date()
): PacoJoseEnvelope {
  const unix = Math.floor(now.getTime() / 1000);
  return {
    request,
    // HBL sample uses merchant API key for both iss and CompanyApiKey payload fields.
    iss: config.apiKey,
    aud: PACO_JOSE.audience,
    CompanyApiKey: config.apiKey,
    iat: unix,
    nbf: unix,
    exp: unix + 3600,
  };
}

/** Format amount like PHP: str_pad(($amt)*100, 12, "0", STR_PAD_LEFT) */
export function formatPacoAmount(amount: number, currencyCode: string) {
  return formatPacoAmountFields(amount, currencyCode);
}
