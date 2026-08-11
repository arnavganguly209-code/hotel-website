#!/usr/bin/env node
/**
 * Static + runtime Production/UAT separation checks (no real secrets).
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function fail(msg) {
  failures.push(msg);
  console.error("FAIL:", msg);
}
function ok(msg) {
  console.log("OK:", msg);
}

const configSrc = fs.readFileSync(path.join(root, "lib/payments/paco/config.ts"), "utf8");
const clientSrc = fs.readFileSync(path.join(root, "lib/payments/paco/client.ts"), "utf8");
const joseSrc = fs.readFileSync(path.join(root, "lib/payments/paco/jose.ts"), "utf8");
const cutover = fs.readFileSync(path.join(root, "scripts/vps-hbl-paco-cutover.sh"), "utf8");

if (!configSrc.includes('officeId: "9104539176"')) fail("Production MID missing from config.ts");
else ok("Production MID 9104539176 in config.ts");

if (!configSrc.includes("https://core.paco.2c2p.com/")) fail("Production endpoint missing from config.ts");
else ok("Production endpoint in config.ts");

if (!configSrc.includes("19f84b5655f04e25a99b09f1ee2fac78")) fail("Production kid missing from config.ts");
else ok("Production kid in config.ts");

if (!configSrc.includes('officeId: "9104137120"')) fail("UAT MID missing from config.ts");
else ok("UAT MID kept separate in config.ts");

if (!configSrc.includes("demo-paco")) fail("UAT endpoint missing from config.ts");
else ok("UAT endpoint kept separate in config.ts");

if (!/rejected UAT merchant ID/.test(configSrc)) fail("Production does not reject UAT MID");
else ok("Production rejects UAT MID");

if (!/SDK_DEMO_SHAPE must not be set in Production/.test(configSrc)) {
  fail("Production does not reject SDK demo shape");
} else ok("Production rejects HBL_PACO_SDK_DEMO_SHAPE");

if (!clientSrc.includes('request3dsFlag: config.request3ds')) {
  fail("prePaymentUi does not send request3dsFlag from config");
} else ok("prePaymentUi uses config.request3ds");

if (!clientSrc.includes("api/1.0/Payment/prePaymentUi")) fail("PACO 1.0 prePaymentUi path missing");
else ok("PACO API 1.0 prePaymentUi preserved");

if (!clientSrc.includes("api/1.0/Inquiry/transactionList")) fail("PACO 1.0 inquiry path missing");
else ok("PACO API 1.0 inquiry preserved");

if (!joseSrc.includes('jwsAlgorithm: "PS256"') && !joseSrc.includes("PACO_JOSE.jwsAlgorithm")) {
  fail("JOSE JWS algorithm wiring missing");
} else ok("JOSE uses PACO_JOSE (PS256 / RSA-OAEP / A128CBC-HS256)");

if (/HBL_PACO_BASE_URL:-\s*https:\/\/core\.demo-paco/.test(cutover) && /production/i.test(cutover) === false) {
  fail("cutover.sh still defaults to UAT without a production guard");
}

if (!/PACO_PRODUCTION|core\.paco\.2c2p\.com/.test(cutover)) {
  fail("cutover.sh does not mention Production endpoint");
} else ok("cutover.sh is Production-aware");

if (failures.length) {
  console.error(`\n${failures.length} static production-config check(s) failed`);
  process.exit(1);
}

const runtime = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["tsx", "scripts/verify-paco-config-runtime.ts"],
  { cwd: root, stdio: "inherit", shell: process.platform === "win32" }
);

if (runtime.status !== 0) {
  process.exit(runtime.status || 1);
}

console.log("\nProduction configuration validation passed.");
