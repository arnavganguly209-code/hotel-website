import fs from "node:fs";
import path from "node:path";
import { parse as parseDotenv } from "dotenv";

const PACO_PREFIX = "HBL_PACO_";

const ENV_FILES_PRODUCTION = [".env", ".env.local", ".env.production", ".env.production.local"];
const ENV_FILES_DEFAULT = [".env", ".env.local", ".env.development", ".env.development.local"];

let cachedKey = "";
let cachedMtime = "";

function envFilesForNodeEnv(): string[] {
  return process.env.NODE_ENV === "production" ? ENV_FILES_PRODUCTION : ENV_FILES_DEFAULT;
}

/**
 * Make `.env*` the source of truth for HBL PACO variables.
 *
 * Next.js and dotenv do not override existing `process.env` keys. PM2
 * `reload --update-env` can therefore pin stale UAT values in the process
 * even after `.env` is switched to Production. This loader re-reads the
 * files and replaces every `HBL_PACO_*` key from disk.
 */
export function syncPacoEnvFromDotenvFile(cwd = process.cwd()): void {
  if (process.env.PACO_SKIP_DOTENV_SYNC === "1") return;

  const files = envFilesForNodeEnv()
    .map((name) => path.join(cwd, name))
    .filter((filePath) => fs.existsSync(filePath));

  const mtimeKey = files
    .map((filePath) => `${filePath}:${fs.statSync(filePath).mtimeMs}`)
    .join("|");
  if (cachedKey === cwd && cachedMtime === mtimeKey) return;
  cachedKey = cwd;
  cachedMtime = mtimeKey;

  const parsed: Record<string, string> = {};
  for (const filePath of files) {
    Object.assign(parsed, parseDotenv(fs.readFileSync(filePath)));
  }

  for (const key of Object.keys(process.env)) {
    if (key.startsWith(PACO_PREFIX)) delete process.env[key];
  }
  for (const [key, value] of Object.entries(parsed)) {
    if (key.startsWith(PACO_PREFIX)) process.env[key] = value;
  }
}

export function resetPacoEnvSyncCache(): void {
  cachedKey = "";
  cachedMtime = "";
}
