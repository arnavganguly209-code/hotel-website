#!/usr/bin/env node
/**
 * Fail if Production PACO secrets or private keys appear in tracked source.
 * Never prints secret values — only file paths and check names.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
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

function trackedFiles() {
  const out = execSync("git ls-files", { cwd: root, encoding: "utf8" });
  return out.split(/\r?\n/).filter(Boolean);
}

const files = trackedFiles().filter((rel) => {
  if (rel.startsWith("tmp/")) return false;
  if (rel.endsWith(".pem") || rel.endsWith(".key")) return false;
  return true;
});

const privateKeyMarker = "BEGIN RSA PRIVATE KEY";
const pkcs8Marker = "BEGIN PRIVATE KEY";
const nextPublicHblAssign = /NEXT_PUBLIC_[A-Z0-9_]*(?:HBL|PACO|API_KEY)[A-Z0-9_]*\s*=/;

for (const rel of files) {
  const abs = path.join(root, rel);
  let text;
  try {
    text = fs.readFileSync(abs, "utf8");
  } catch {
    continue;
  }
  if (text.includes(privateKeyMarker) || text.includes(pkcs8Marker)) {
    // Allow the PEM wrapper template in config/jose helpers — not an actual key body.
    const looksLikeTemplate =
      /`-----BEGIN (RSA )?PRIVATE KEY-----\\n\$\{/.test(text) ||
      /-----BEGIN (RSA )?PRIVATE KEY-----\\n\$\{/.test(text);
    const hasLongBase64 = /-----BEGIN (RSA )?PRIVATE KEY-----\s*[A-Za-z0-9+/]{80,}/.test(text);
    if (hasLongBase64 && !looksLikeTemplate) {
      fail(`private key material in tracked file: ${rel}`);
    }
  }
  if (nextPublicHblAssign.test(text) && !rel.endsWith(".example")) {
    fail(`NEXT_PUBLIC PACO/HBL binding in tracked file: ${rel}`);
  }
  if (/HBL_PACO_API_KEY\s*=\s*[a-fA-F0-9]{32}/.test(text)) {
    fail(`HBL PACO API credential assigned in tracked file: ${rel}`);
  }
}

ok(`scanned ${files.length} tracked files for private-key / NEXT_PUBLIC PACO leakage`);

const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
if (!/^\.env$/m.test(gitignore) && !gitignore.includes(".env")) {
  fail(".env is not gitignored");
} else {
  ok(".env is gitignored");
}
if (!gitignore.includes("*.pem")) fail("*.pem is not gitignored");
else ok("*.pem is gitignored");
if (!gitignore.includes("*.key")) fail("*.key is not gitignored");
else ok("*.key is gitignored");

const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
if (/HBL_PACO_API_KEY=\s*[a-f0-9]{20,}/i.test(envExample)) {
  fail(".env.example contains an API key value");
} else {
  ok(".env.example does not contain an API key value");
}

try {
  const staged = execSync("git diff --cached --name-only", { cwd: root, encoding: "utf8" });
  const banned = staged
    .split(/\r?\n/)
    .filter((f) => /^\.env($|\.)/.test(f) || /\.(pem|key)$/.test(f));
  if (banned.length) fail(`banned files currently staged: ${banned.join(", ")}`);
  else ok("no .env / pem / key files currently staged");
} catch {
  ok("git staged scan skipped");
}

if (failures.length) {
  console.error(`\n${failures.length} secret-scan check(s) failed`);
  process.exit(1);
}
console.log("\nSecret exposure checks passed.");
