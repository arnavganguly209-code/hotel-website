import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ASSETS =
  "C:/Users/Admin/.cursor/projects/c-Users-Admin-Desktop-ARNAB-hotel-thamel-park-spa/assets";
const OUT = path.resolve("public/media/payments");

const FILES = [
  { out: "01-visa.png", match: /VISA_1/i },
  { out: "02-mastercard.png", match: /Master_2/i },
  { out: "03-unionpay.png", match: /UnionPay/i },
  { out: "04-alipay.png", match: /Alipay_3/i },
  { out: "05-upi.png", match: /UPI_4/i },
  { out: "06-esewa.png", match: /Esewa_6/i },
];

/** Row/col is "empty" only if every pixel is near-black. Dark logo ink stays. */
const EMPTY = 18;

function findSource(match) {
  const hit = fs.readdirSync(ASSETS).find((n) => match.test(n));
  if (!hit) throw new Error(`No asset matching ${match}`);
  return path.join(ASSETS, hit);
}

function rowHasContent(data, width, channels, y) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    if (Math.max(data[i], data[i + 1], data[i + 2]) > EMPTY) return true;
  }
  return false;
}

function colHasContent(data, width, height, channels, x) {
  for (let y = 0; y < height; y++) {
    const i = (y * width + x) * channels;
    if (Math.max(data[i], data[i + 1], data[i + 2]) > EMPTY) return true;
  }
  return false;
}

async function processOne(srcPath, outPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  let minY = 0;
  while (minY < height && !rowHasContent(data, width, channels, minY)) minY++;
  let maxY = height - 1;
  while (maxY > minY && !rowHasContent(data, width, channels, maxY)) maxY--;
  let minX = 0;
  while (minX < width && !colHasContent(data, width, height, channels, minX)) minX++;
  let maxX = width - 1;
  while (maxX > minX && !colHasContent(data, width, height, channels, maxX)) maxX--;

  if (minX >= maxX || minY >= maxY) {
    // Fallback: copy original
    await sharp(srcPath).png().toFile(outPath);
    console.log(`COPY ${path.basename(outPath)} (no trim)`);
    return;
  }

  // Small pad so we don't clip anti-alias
  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  await sharp(srcPath)
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png()
    .toFile(outPath);

  const meta = await sharp(outPath).metadata();
  console.log(
    `OK ${path.basename(outPath)} ${meta.width}x${meta.height} (from ${width}x${height})`
  );
}

fs.mkdirSync(OUT, { recursive: true });
for (const file of FILES) {
  await processOne(findSource(file.match), path.join(OUT, file.out));
}
console.log("Done →", OUT);
