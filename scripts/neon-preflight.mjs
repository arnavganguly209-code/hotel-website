#!/usr/bin/env node
/**
 * Preflight: can we still read Neon? Prints host + table counts only (no secrets).
 * Usage: node scripts/neon-preflight.mjs
 */
import pg from "pg";
import fs from "fs";
import path from "path";

const { Client } = pg;

function loadDatabaseUrl() {
  const envPath = path.join(process.cwd(), ".env");
  const text = fs.readFileSync(envPath, "utf8");
  const line = text.split(/\n/).find((l) => l.startsWith("DATABASE_URL="));
  if (!line) throw new Error("DATABASE_URL missing");
  return line.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
}

async function main() {
  const url = loadDatabaseUrl();
  const host = (url.match(/@([^/:]+)/) || [])[1] || "(unknown)";
  console.log("DATABASE host:", host);
  console.log("Is Neon:", /neon\.tech/i.test(host));
  if (!/neon\.tech/i.test(host)) {
    console.log("Not Neon - nothing to preflight.");
    return;
  }
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const tables = [
    "SiteContentRecord",
    "Booking",
    "ContactEnquiry",
    "DiningReservation",
    "EventInquiry",
    "AdminUser",
    "RoomInventory",
    "NewsletterSubscriber",
    "MediaFile",
  ];
  for (const t of tables) {
    try {
      const r = await client.query("SELECT COUNT(*)::int AS n FROM \"" + t + "\"");
      console.log("  " + t + ": " + r.rows[0].n);
    } catch (e) {
      console.log("  " + t + ": (missing) " + e.message.split("\n")[0]);
    }
  }
  await client.end();
  console.log("Neon is readable - VPS migration can dump from it.");
}

main().catch((e) => {
  console.error("Neon preflight FAILED:", e.message);
  process.exit(1);
});
