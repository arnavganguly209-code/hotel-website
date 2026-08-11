#!/usr/bin/env node
/**
 * Keep only live bookable room categories on the public site / admin lists.
 * Archives Super Deluxe Twin (and any other available:false leftovers stay archived).
 */
import { readFileSync, existsSync } from "node:fs";
import pg from "pg";

const APP = process.cwd();
const HIDE_IDS = new Set(["super-deluxe-twin", "super-deluxe-twin-room"]);

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
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
loadEnvFile(`${APP}/.env`);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const q = await pool.query(`SELECT content FROM "SiteContentRecord" WHERE id = 'main'`);
if (!q.rows[0]) {
  console.error("FAIL: SiteContentRecord main missing");
  process.exit(1);
}
const content = q.rows[0].content;
const rooms = Array.isArray(content.rooms) ? content.rooms : [];
let changed = 0;
content.rooms = rooms.map((room) => {
  const id = String(room.id || "");
  const slug = String(room.slug || "");
  if (HIDE_IDS.has(id) || HIDE_IDS.has(slug) || /twin/i.test(id) || /twin/i.test(slug)) {
    if (room.available !== false || room.visible !== false) changed += 1;
    return { ...room, available: false, visible: false };
  }
  return room;
});
await pool.query(`UPDATE "SiteContentRecord" SET content = $1::jsonb WHERE id = 'main'`, [
  JSON.stringify(content),
]);
await pool.end();
const live = content.rooms.filter((r) => r.available !== false).map((r) => ({ id: r.id, name: r.name, price: r.price }));
console.log(JSON.stringify({ ok: true, archivedTwinUpdates: changed, liveCategories: live }, null, 2));
