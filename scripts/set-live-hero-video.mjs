#!/usr/bin/env node
/**
 * Point live CMS hero at the web-optimized 0811 hotel video.
 * Never prints secrets.
 */
import { readFileSync, existsSync } from "node:fs";
import pg from "pg";

const APP = process.cwd();
const DESKTOP = "/media/hero/hotel-thamel-park-hero.mp4";
const MOBILE = "/media/hero/hotel-thamel-park-hero-mobile.mp4";

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
const prev = content.hero?.videoSrc || "";
content.hero = {
  ...content.hero,
  mediaMode: "video",
  videoSrc: DESKTOP,
  videoSrcMobile: MOBILE,
  poster: "",
  videoAutoplay: true,
  videoLoop: true,
  videoMuted: true,
};
content.performanceSettings = {
  ...(content.performanceSettings || {}),
  mediaRevision: String(Date.now()),
};
await pool.query(`UPDATE "SiteContentRecord" SET content = $1::jsonb WHERE id = 'main'`, [
  JSON.stringify(content),
]);
await pool.end();
console.log(
  JSON.stringify(
    {
      ok: true,
      previousVideoSrc: prev,
      videoSrc: DESKTOP,
      videoSrcMobile: MOBILE,
    },
    null,
    2
  )
);
