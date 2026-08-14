#!/usr/bin/env node
/**
 * Normalize live dining Atmosphere / Restaurant Gallery to 3 Orbit boxes.
 * Clears src when the file is missing on disk so empty gold frames disappear.
 * Never prints secrets.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const APP = process.cwd();
const PUBLIC = path.join(APP, "public");

const SLOT_DEFAULTS = [
  { id: "d1", title: "Garden Restaurant", alt: "Garden View Korean Restaurant" },
  { id: "d2", title: "Sky Lounge", alt: "Sky Lounge Restaurant and Bar" },
  { id: "d3", title: "Lobby Moments", alt: "Lobby cafe dining ambience" },
];

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadEnvFile(path.join(APP, ".env"));

function mediaExists(src) {
  const raw = String(src || "").trim();
  if (!raw || /^https?:\/\//i.test(raw)) return Boolean(raw);
  const clean = raw.split("?")[0].replace(/^\/+/, "");
  return existsSync(path.join(PUBLIC, clean));
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const q = await pool.query(`SELECT content FROM "SiteContentRecord" WHERE id = 'main'`);
if (!q.rows[0]) {
  console.error("FAIL: SiteContentRecord main missing");
  process.exit(1);
}

const content = q.rows[0].content;
const page = content.diningPage || {};
const source = Array.isArray(page.gallery) ? page.gallery : [];
let cleared = 0;

const gallery = SLOT_DEFAULTS.map((slot, i) => {
  const existing = source[i] || {};
  let src = String(existing.src || "").trim();
  if (src && !mediaExists(src)) {
    src = "";
    cleared += 1;
  }
  return {
    id: existing.id || slot.id,
    src,
    title: existing.title || slot.title,
    alt: existing.alt || slot.alt,
    enabled: existing.enabled !== false,
    order: i,
  };
});

content.diningPage = {
  ...page,
  gallerySection: {
    eyebrow: page.gallerySection?.eyebrow || "Atmosphere",
    title: page.gallerySection?.title || "Restaurant Gallery",
    description:
      page.gallerySection?.description ||
      "A glimpse into our restaurants, tablescapes, and evenings above the city.",
  },
  gallery,
};

await pool.query(`UPDATE "SiteContentRecord" SET content = $1::jsonb WHERE id = 'main'`, [
  JSON.stringify(content),
]);
await pool.end();

console.log(
  JSON.stringify(
    {
      ok: true,
      slots: gallery.length,
      filled: gallery.filter((g) => g.src).length,
      clearedMissingFiles: cleared,
    },
    null,
    2
  )
);
