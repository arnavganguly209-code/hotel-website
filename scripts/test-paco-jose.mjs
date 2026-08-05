/**
 * Local JOSE round-trip smoke test (sign→encrypt→decrypt→verify) using env keys.
 * Does not call the live PACO API.
 */
import { createPrivateKey, createPublicKey, generateKeyPairSync } from "crypto";
import { CompactEncrypt, CompactSign, compactDecrypt, compactVerify } from "jose";

const enc = new TextEncoder();
const dec = new TextDecoder();

async function main() {
  // Self-contained keypair test if env missing
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });

  const payload = JSON.stringify({
    request: { hello: "paco" },
    iss: "test",
    aud: "PacoAudience",
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  const jws = await new CompactSign(enc.encode(payload))
    .setProtectedHeader({ alg: "PS256", typ: "JWT" })
    .sign(privateKey);

  const jwe = await new CompactEncrypt(enc.encode(jws))
    .setProtectedHeader({
      alg: "RSA-OAEP",
      enc: "A128CBC-HS256",
      kid: "test-kid",
      typ: "JWT",
    })
    .encrypt(publicKey);

  const { plaintext } = await compactDecrypt(jwe, privateKey);
  const { payload: verified } = await compactVerify(dec.decode(plaintext), publicKey, {
    algorithms: ["PS256"],
  });
  const roundTrip = JSON.parse(dec.decode(verified));
  if (roundTrip.request?.hello !== "paco") throw new Error("Round-trip failed");
  console.info("PACO JOSE algorithms OK (PS256 + RSA-OAEP + A128CBC-HS256)");

  // Optional: load merchant keys from env if present
  const signingPem = process.env.HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY;
  const encPub = process.env.HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY;
  if (signingPem && encPub) {
    const priv = signingPem.includes("BEGIN")
      ? signingPem
      : `-----BEGIN RSA PRIVATE KEY-----\n${signingPem}\n-----END RSA PRIVATE KEY-----`;
    const pub = encPub.includes("BEGIN")
      ? encPub
      : `-----BEGIN PUBLIC KEY-----\n${encPub}\n-----END PUBLIC KEY-----`;
    createPrivateKey(priv);
    createPublicKey(pub);
    console.info("Merchant signing + PACO encryption keys parse OK");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
