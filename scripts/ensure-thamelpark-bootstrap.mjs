#!/usr/bin/env node
/**
 * Ensure thamelpark PostgreSQL has a CMS row + MediaFile index for existing uploads.
 * Runtime CMS is PostgreSQL only.
 *
 * - If SiteContentRecord "main" exists with content → leave it.
 * - Else upsert a minimal hotel shell (Orbit fills the rest into Postgres).
 * - Index public/uploads files into MediaFile without deleting or overwriting files.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import pg from "pg";

const { Client } = pg;

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = path.join(process.cwd(), ".env");
  const text = fs.readFileSync(envPath, "utf8");
  const line = text.split(/\n/).find((l) => l.startsWith("DATABASE_URL="));
  if (!line) throw new Error("DATABASE_URL missing");
  return line.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
}

function uploadsRoot() {
  const fromEnv = (process.env.UPLOADS_ROOT || "").trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.join(process.cwd(), "public", "uploads");
}

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkFiles(full, out);
    else if (st.isFile() && !name.startsWith(".")) out.push(full);
  }
  return out;
}

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
  };
  return map[ext] || "application/octet-stream";
}

async function ensureCms(client) {
  const existing = await client.query(
    `SELECT id, pg_column_size(content) AS bytes FROM "SiteContentRecord" WHERE id = 'main'`
  );
  if (existing.rows[0]?.bytes > 50) {
    console.log("SiteContentRecord main already present (bytes=", existing.rows[0].bytes, ") — keep");
    return;
  }

  const content = {
    hotel: {
      name: "Hotel Thamel Park",
      tagline: "Luxury Stay Experience in the Heart of Thamel, Kathmandu",
      location: "Thamel, Kathmandu, Nepal",
    },
  };
  await client.query(
    `INSERT INTO "SiteContentRecord" (id, content, "updatedAt")
     VALUES ('main', $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE
     SET content = EXCLUDED.content, "updatedAt" = NOW()`,
    [JSON.stringify(content)]
  );
  console.log("SiteContentRecord minimal shell upserted (Postgres only)");
}

async function indexUploads(client) {
  const root = uploadsRoot();
  const files = walkFiles(root);
  let inserted = 0;
  let skipped = 0;
  for (const full of files) {
    const rel = path.relative(root, full).replace(/\\/g, "/");
    const url = `/uploads/${rel}`;
    const folder = rel.includes("/") ? rel.split("/").slice(0, -1).join("/") : "uploads";
    const filename = path.basename(full);
    const size = fs.statSync(full).size;
    const mimeType = mimeFor(full);

    const exists = await client.query(`SELECT id FROM "MediaFile" WHERE url = $1 LIMIT 1`, [url]);
    if (exists.rows.length) {
      skipped += 1;
      continue;
    }
    await client.query(
      `INSERT INTO "MediaFile" (id, filename, url, folder, "mimeType", size, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [crypto.randomUUID(), filename, url, folder, mimeType, size]
    );
    inserted += 1;
  }
  console.log(`MediaFile index: inserted=${inserted} skipped=${skipped} scanned=${files.length} root=${root}`);
}

async function ensureAdmin(client) {
  const r = await client.query(`SELECT COUNT(*)::int AS n FROM "AdminUser"`);
  console.log("AdminUser count =", r.rows[0].n, "(app will bootstrap thamelpark on first login if 0)");
}

async function main() {
  const url = loadDatabaseUrl();
  const host = (url.match(/@([^/:?]+)/) || [])[1] || "";
  if (!/^(127\.0\.0\.1|localhost)$/i.test(host) || !/thamelpark/i.test(url)) {
    throw new Error("DATABASE_URL must target localhost thamelpark");
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  await ensureCms(client);
  await indexUploads(client);
  await ensureAdmin(client);

  const tables = await client.query(`
    SELECT relname AS name, n_live_tup::int AS rows
    FROM pg_stat_user_tables
    ORDER BY 1`);
  console.log("Table row estimates:");
  for (const row of tables.rows) {
    console.log(`  ${row.name}: ${row.rows}`);
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
