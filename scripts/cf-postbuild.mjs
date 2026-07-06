import fs from "node:fs";
import path from "node:path";

const targets = [".next/cache", ".next/trace"];

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  fs.rmSync(target, { recursive: true, force: true });
  console.log(`[cf-postbuild] Removed ${target}`);
}

const assetsDir = path.join(".open-next", "assets");
if (fs.existsSync(assetsDir)) {
  const assetsIgnore = path.join(assetsDir, ".assetsignore");
  const ignoreBody = [
    "# Prevent accidental upload of build artifacts",
    "*.map",
    ".DS_Store",
    "node_modules/",
    ".git/",
    ".env",
    ".env.*",
    "",
  ].join("\n");
  fs.writeFileSync(assetsIgnore, ignoreBody, "utf8");
  console.log("[cf-postbuild] Wrote .open-next/assets/.assetsignore");
}

if (!fs.existsSync(path.join(".open-next", "worker.js"))) {
  console.error("[cf-postbuild] Missing .open-next/worker.js — OpenNext build did not complete.");
  process.exit(1);
}

console.log("[cf-postbuild] Cloudflare Worker bundle ready.");
