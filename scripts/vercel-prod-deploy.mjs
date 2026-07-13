/**
 * Production deploy to Vercel from SOURCE (never stale --prebuilt output).
 * Removes local .vercel/output so an old prebuild cannot be uploaded by mistake.
 */
import { rmSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, ".vercel", "output");

if (existsSync(outputDir)) {
  console.log("[deploy:vercel] Removing stale .vercel/output ...");
  rmSync(outputDir, { recursive: true, force: true });
}

console.log("[deploy:vercel] Deploying production from current source (remote build)...");
const result = spawnSync(
  "npx",
  ["vercel", "deploy", "--prod", "--yes", "--archive=tgz"],
  {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: process.env,
  }
);

process.exit(result.status ?? 1);
