import { mkdir, writeFile, copyFile, access } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicMedia = path.join(root, "public", "media");

const ASSETS = {
  "gallery/01.jpg": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85",
  "gallery/02.jpg": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=85",
  "gallery/03.jpg": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=85",
  "gallery/04.jpg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85",
  "gallery/05.jpg": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=85",
  "gallery/06.jpg": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=85",
  "rooms/super-deluxe-twin.jpg": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=85",
  "rooms/super-deluxe.jpg": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=85",
  "rooms/family-room.jpg": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=85",
  "rooms/standard-deluxe.jpg": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=85",
  "dining/korean-restaurant.jpg": "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=85",
  "dining/lobby-cafe.jpg": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=85",
  "dining/skyz-lounge.jpg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85",
  "spa/wellness.jpg": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=85",
  "spa/treatment.jpg": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=85",
  "culture/nepali-culture.jpg": "https://images.unsplash.com/photo-1544735716-392fe2489f1f?auto=format&fit=crop&w=1600&q=85",
  "logo.png": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=85",
};

async function download(relativePath, url) {
  const dest = path.join(publicMedia, relativePath);
  await mkdir(path.dirname(dest), { recursive: true });
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buffer);
    console.log(`✓ ${relativePath}`);
  } catch (error) {
    const fallback = path.join(publicMedia, "gallery/01.jpg");
    try {
      await access(fallback);
      await copyFile(fallback, dest);
      console.log(`↪ ${relativePath} (fallback copy)`);
    } catch {
      console.warn(`✗ ${relativePath} (${error.message})`);
    }
  }
}

console.log("Seeding premium media to public/media …");
for (const [relativePath, url] of Object.entries(ASSETS)) {
  await download(relativePath, url);
}
console.log("Done.");
