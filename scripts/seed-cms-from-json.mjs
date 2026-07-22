#!/usr/bin/env node
/**
 * Upsert SiteContentRecord from data/site-content.json into DATABASE_URL.
 * Used when Neon dump is blocked (quota) so VPS localhost still has CMS content.
 */
import fs from "fs";
import path from "path";
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

async function main() {
  const jsonPath = path.join(process.cwd(), "data", "site-content.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Missing ${jsonPath}`);
  }
  const content = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const url = loadDatabaseUrl();
  if (/neon\.tech/i.test(url)) {
    throw new Error("Refusing to seed into Neon — DATABASE_URL must be localhost");
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  await client.query(
    `INSERT INTO "SiteContentRecord" (id, content, "updatedAt")
     VALUES ('main', $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE
     SET content = EXCLUDED.content, "updatedAt" = NOW()`,
    [JSON.stringify(content)]
  );
  const r = await client.query(
    `SELECT id, pg_column_size(content) AS bytes FROM "SiteContentRecord" WHERE id = 'main'`
  );
  console.log("Seeded SiteContentRecord id=main bytes=", r.rows[0]?.bytes ?? 0);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
