#!/usr/bin/env node
/**
 * Fail closed unless DATABASE_URL is local PostgreSQL database "thamelpark".
 * Used by deploy / bootstrap so the app never opens a remote DB connection.
 */
import fs from "fs";
import path from "path";

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL.trim();
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error("DATABASE_URL missing (no process env and no .env)");
  }
  const line = fs
    .readFileSync(envPath, "utf8")
    .split(/\n/)
    .find((l) => l.startsWith("DATABASE_URL="));
  if (!line) throw new Error("DATABASE_URL missing from .env");
  return line.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
}

function hostOf(url) {
  try {
    return new URL(url).hostname || "";
  } catch {
    return (url.match(/@([^/:?]+)/) || [])[1] || "";
  }
}

function nameOf(url) {
  try {
    return decodeURIComponent((new URL(url).pathname || "").replace(/^\//, "").split("/")[0] || "");
  } catch {
    const pathPart = (url.split("?")[0] || "").split("@")[1] || "";
    const slash = pathPart.indexOf("/");
    return slash >= 0 ? decodeURIComponent(pathPart.slice(slash + 1)) : "";
  }
}

const url = loadDatabaseUrl();
const host = hostOf(url).toLowerCase();
const name = nameOf(url).toLowerCase();
const isLocal = host === "127.0.0.1" || host === "localhost" || host === "::1";

if (!isLocal) {
  console.error(
    'ERROR: DATABASE_URL must use local PostgreSQL on 127.0.0.1 or localhost (database "thamelpark"). Remote database hosts are not supported.'
  );
  process.exit(1);
}
if (name !== "thamelpark") {
  console.error('ERROR: DATABASE_URL must target the local PostgreSQL database "thamelpark".');
  process.exit(1);
}

console.log("OK: DATABASE_URL → local thamelpark");
