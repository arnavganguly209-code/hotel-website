#!/usr/bin/env node
/**
 * Reload PM2 from the current `.env` file so stale PM2 dump values cannot
 * pin HBL UAT after a Production cutover.
 *
 * Never prints secrets. Intended for VPS only.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parse as parseDotenv } from "dotenv";

const PACO_PRODUCTION = {
  officeId: "9104539176",
  baseUrl: "https://core.paco.2c2p.com/",
  encryptionKeyId: "19f84b5655f04e25a99b09f1ee2fac78",
};
const PACO_UAT = {
  officeId: "9104137120",
  encryptionKeyId: "7664a2ed0dee4879bdfca0e8ce1ac313",
};

const ROOT = process.cwd();
const APP_NAME = "hotel-thamel-park";
const ENV_PATH = path.join(ROOT, ".env");

if (!fs.existsSync(ENV_PATH)) {
  console.error("FAIL: .env missing");
  process.exit(1);
}

const parsed = parseDotenv(fs.readFileSync(ENV_PATH));
for (const key of Object.keys(process.env)) {
  if (key.startsWith("HBL_PACO_")) delete process.env[key];
}
for (const [key, value] of Object.entries(parsed)) {
  if (key.startsWith("HBL_PACO_")) process.env[key] = value;
}

const mode = String(process.env.HBL_PACO_ENV || "").toLowerCase();
const officeId = String(process.env.HBL_PACO_OFFICE_ID || "").trim();
const baseUrl = String(process.env.HBL_PACO_BASE_URL || "").trim();
const kid = String(process.env.HBL_PACO_ENCRYPTION_KEY_ID || "").trim();
const currency = String(process.env.HBL_PACO_CURRENCY || "USD").trim().toUpperCase();
const tds = String(process.env.HBL_PACO_REQUEST_3DS || "Y").trim();
const demoShape = Boolean(String(process.env.HBL_PACO_SDK_DEMO_SHAPE || "").trim());

console.log("dotenv_nonsecret", {
  env: mode || "(unset)",
  officeId,
  baseUrl,
  kid,
  currency,
  request3ds: tds,
  sdkDemoShape: demoShape,
});

if (mode === "production" || mode === "prod") {
  const errors = [];
  if (officeId === PACO_UAT.officeId) errors.push("UAT MID");
  if (officeId !== PACO_PRODUCTION.officeId) errors.push("Production MID mismatch");
  if (/demo-paco/i.test(baseUrl)) errors.push("demo-paco endpoint");
  if (!/^https:\/\/core\.paco\.2c2p\.com\/?$/i.test(baseUrl)) errors.push("Production endpoint mismatch");
  if (kid === PACO_UAT.encryptionKeyId) errors.push("UAT kid");
  if (kid !== PACO_PRODUCTION.encryptionKeyId) errors.push("Production kid mismatch");
  if (currency !== "USD") errors.push("currency must be USD");
  if (tds !== "Y") errors.push("request3dsFlag must be Y");
  if (demoShape) errors.push("SDK demo shape set");
  if (errors.length) {
    console.error("FAIL: refusing to reload PM2 with Production/UAT mismatch:", errors.join(", "));
    process.exit(1);
  }
}

function runPm2(args) {
  const res = spawnSync("pm2", args, {
    cwd: ROOT,
    env: process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  return res.status || 0;
}

function readRunningPaco() {
  const pidRes = spawnSync("pm2", ["pid", APP_NAME], { encoding: "utf8" });
  const pid = String(pidRes.stdout || "").trim().split(/\s+/)[0] || "";
  if (!pid || !fs.existsSync(`/proc/${pid}/environ`)) {
    return { pid, runtime: null };
  }
  const map = Object.fromEntries(
    fs
      .readFileSync(`/proc/${pid}/environ`)
      .toString("utf8")
      .split("\0")
      .filter(Boolean)
      .map((line) => {
        const i = line.indexOf("=");
        return i >= 0 ? [line.slice(0, i), line.slice(i + 1)] : [line, ""];
      })
  );
  return {
    pid,
    runtime: {
      env: map.HBL_PACO_ENV || "(unset)",
      officeId: map.HBL_PACO_OFFICE_ID || "(unset)",
      baseUrl: map.HBL_PACO_BASE_URL || "(unset)",
      kid: map.HBL_PACO_ENCRYPTION_KEY_ID || "(unset)",
      currency: map.HBL_PACO_CURRENCY || "(unset)",
      request3ds: map.HBL_PACO_REQUEST_3DS || "(unset)",
      sdkDemoShape: Boolean(String(map.HBL_PACO_SDK_DEMO_SHAPE || "").trim()),
    },
  };
}

function runtimeMatchesFile(runtime) {
  if (!runtime) return false;
  if (mode === "production" || mode === "prod") {
    return (
      (runtime.env === "production" || runtime.env === "prod") &&
      runtime.officeId === PACO_PRODUCTION.officeId &&
      /^https:\/\/core\.paco\.2c2p\.com\/?$/i.test(runtime.baseUrl) &&
      runtime.kid === PACO_PRODUCTION.encryptionKeyId &&
      runtime.currency === "USD" &&
      runtime.request3ds === "Y" &&
      runtime.officeId !== PACO_UAT.officeId &&
      !/demo-paco/i.test(runtime.baseUrl) &&
      runtime.kid !== PACO_UAT.encryptionKeyId &&
      !runtime.sdkDemoShape
    );
  }
  return runtime.env === mode || (mode === "" && runtime.env);
}

console.log("Reloading PM2 from ecosystem.config.js using current .env PACO values...");
let rc = runPm2(["reload", "ecosystem.config.js", "--update-env"]);
if (rc !== 0) {
  console.log("reload failed — restarting from ecosystem.config.js");
  rc = runPm2(["restart", "ecosystem.config.js", "--update-env"]);
}
if (rc !== 0) {
  console.log("restart failed — delete + start from ecosystem.config.js");
  runPm2(["delete", APP_NAME]);
  rc = runPm2(["start", "ecosystem.config.js"]);
}
if (rc !== 0) {
  console.error("FAIL: PM2 reload/restart from .env failed");
  process.exit(rc);
}

let { pid, runtime } = readRunningPaco();
console.log("pm2_pid", pid);
console.log("running_process_nonsecret", runtime);
if (!runtimeMatchesFile(runtime)) {
  console.log("running process still mismatched — performing clean PM2 delete + start");
  runPm2(["delete", APP_NAME]);
  rc = runPm2(["start", "ecosystem.config.js"]);
  if (rc !== 0) {
    console.error("FAIL: PM2 start from ecosystem.config.js failed");
    process.exit(rc);
  }
  ({ pid, runtime } = readRunningPaco());
  console.log("pm2_pid", pid);
  console.log("running_process_nonsecret", runtime);
}
runPm2(["save"]);
if (!runtimeMatchesFile(runtime)) {
  console.error("FAIL: running PM2 process still does not match .env PACO identifiers");
  process.exit(1);
}
if (mode === "production" || mode === "prod") {
  console.log("OK: running PM2 process matches Production PACO identifiers");
} else {
  console.log("OK: running PM2 process matches .env PACO identifiers");
}
