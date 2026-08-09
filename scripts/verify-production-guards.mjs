#!/usr/bin/env node
/**
 * Production sanity checks — no Edge middleware / no deploy-beacon artifacts in source.
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const root = process.cwd();
const failures = [];

function fail(msg) {
  failures.push(msg);
  console.error("FAIL:", msg);
}

function ok(msg) {
  console.log("OK:", msg);
}

// 1) Edge middleware must not exist (prevents ./web/sandbox load path)
if (fs.existsSync(path.join(root, "middleware.ts")) || fs.existsSync(path.join(root, "middleware.js"))) {
  fail("middleware.ts/js still present — would load next/dist/server/web/sandbox");
} else {
  ok("no Edge middleware source file");
}

// 2) Deploy beacon / deploy-log must not be written by workflow (only purged)
const deployYml = fs.readFileSync(path.join(root, ".github/workflows/deploy.yml"), "utf8");
if (/BEACON\s*=/.test(deployYml) || />>\s*"\$BEACON"/.test(deployYml) || />\s*"\$BEACON"/.test(deployYml)) {
  fail("deploy.yml still writes deploy-beacon");
} else {
  ok("deploy.yml does not write deploy-beacon");
}
if (/echo\s+.*>\s*.*deploy-log/.test(deployYml)) {
  fail("deploy.yml still writes deploy-log");
} else {
  ok("deploy.yml does not write deploy-log");
}

// 3) Public tree must not ship beacon/log files
const banned = [
  "public/uploads/general/deploy-beacon.txt",
  "public/uploads/general/deploy-log.txt",
  "public/__deploy-beacon.txt",
  "public/__deploy-status.json",
];
for (const rel of banned) {
  if (fs.existsSync(path.join(root, rel))) {
    fail(`banned production file present: ${rel}`);
  }
}
ok("no banned deploy-beacon/deploy-log files in public/");

// 5b) PACO live path must not enable HBL sample demo via env
const pacoClient = fs.readFileSync(path.join(root, "lib/payments/paco/client.ts"), "utf8");
if (/process\.env\.HBL_PACO_SDK_DEMO_SHAPE/.test(pacoClient)) {
  fail("lib/payments/paco/client.ts still enables SDK demo shape via env (leaks sample NPR/Postman into live bookings)");
} else {
  ok("PACO SDK demo shape is not env-enabled");
}
if (/currencyCode:\s*["']NPR["']/.test(pacoClient) && /purchaseItemPrice/.test(pacoClient)) {
  // Allow comments; fail only if NPR literal sits near purchaseItemPrice assignment in same line cluster
  const lines = pacoClient.split(/\r?\n/);
  const bad = lines.some(
    (line) =>
      /purchaseItemPrice/.test(line) && /["']NPR["']/.test(line) && !/^\s*\/\//.test(line) && !/\*/.test(line)
  );
  if (bad) fail("hard-coded NPR in purchaseItemPrice line");
  else ok("no hard-coded NPR purchaseItemPrice assignment");
} else {
  ok("no hard-coded NPR purchaseItemPrice");
}

// 4) If a production build exists, middleware manifest must be empty
const manifestPath = path.join(root, ".next/server/middleware-manifest.json");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const hasMw =
    (manifest.sortedMiddleware && manifest.sortedMiddleware.length > 0) ||
    (manifest.middleware && Object.keys(manifest.middleware).length > 0);
  if (hasMw) {
    fail("middleware-manifest.json still lists middleware");
  } else {
    ok("middleware-manifest.json is empty");
  }
} else {
  ok("no middleware-manifest yet (build will create empty one)");
}

// 5) Next sandbox module must resolve when next is installed (package integrity)
try {
  const nextServer = path.dirname(require.resolve("next/dist/server/next-server"));
  const sandbox = path.join(nextServer, "web", "sandbox", "index.js");
  if (!fs.existsSync(sandbox)) {
    fail(`next package missing sandbox at ${sandbox}`);
  } else {
    ok("next/dist/server/web/sandbox present (package intact)");
  }
} catch (e) {
  fail(`cannot resolve next server: ${e.message}`);
}

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}

console.log("\nAll production sanity checks passed");
