/**
 * Media reliability smoke checks (fingerprint + SafeImage invariants).
 * Run: node scripts/verify-media-reliability.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const safeImage = read("components/shared/SafeImage.tsx");
assert.match(safeImage, /naturalWidth/, "SafeImage must detect cached complete loads");
assert.match(safeImage, /RECOVER_MS/, "SafeImage must soft-recover forever");
assert.match(safeImage, /fadeIn \?\? false/, "SafeImage fade must default off");
assert.match(safeImage, /!enableFade && "opacity-100"/, "SafeImage must stay visible when fade is off");

const safeVideo = read("components/shared/SafeVideo.tsx");
assert.match(safeVideo, /RECOVER_MS/, "SafeVideo must soft-recover");
assert.match(safeVideo, /clearTimers/, "SafeVideo must clear retry timers");

const contentRoute = read("app/api/content/route.ts");
assert.match(contentRoute, /mediaFingerprint/, "Content save must fingerprint media");
assert.match(contentRoute, /mediaChanged/, "Revision bump only when media changes");

const roomCard = read("components/shared/RoomCard.tsx");
assert.doesNotMatch(roomCard, /imageError/, "RoomCard must not permanently hide images");

const placeholder = read("components/shared/MediaPlaceholder.tsx");
assert.doesNotMatch(placeholder, /setError\(true\)/, "MediaPlaceholder must not permanently hide images");

const luxuryBox = read("components/shared/LuxuryImageBox.tsx");
assert.doesNotMatch(luxuryBox, /setError\(true\)/, "LuxuryImageBox must not permanently hide images");

const perf = read("components/shared/PerformanceProvider.tsx");
assert.match(perf, /setMediaRevision/, "PerformanceProvider must support live revision updates");
assert.match(perf, /imageFadeIn: value\.imageFadeIn === true/, "imageFadeIn must be opt-in");

console.log("Media reliability invariants: PASS");
