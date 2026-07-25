/**
 * Quick occupancy + pricing matrix check (no build required).
 * Mirrors lib/booking/occupancy.ts seed policies.
 */
const DEFAULT = {
  "super-deluxe-twin": { price: 60, baseAdults: 2, baseChildren: 1, maxAdults: 3, maxChildren: 2, extraAdultPrice: 5, extraChildPrice: 5 },
  "super-deluxe": { price: 60, baseAdults: 2, baseChildren: 1, maxAdults: 3, maxChildren: 2, extraAdultPrice: 5, extraChildPrice: 5 },
  "family-room": { price: 55, baseAdults: 4, baseChildren: 2, maxAdults: 4, maxChildren: 2, extraAdultPrice: 0, extraChildPrice: 0 },
  "standard-deluxe": { price: 50, baseAdults: 2, baseChildren: 1, maxAdults: 2, maxChildren: 2, extraAdultPrice: 0, extraChildPrice: 5 },
};

function fits(room, adults, children) {
  return adults <= room.maxAdults && children <= room.maxChildren;
}

function breakdown(room, adults, children, nights = 1) {
  const extraAdults = Math.max(0, adults - room.baseAdults);
  const extraChildren = Math.max(0, children - room.baseChildren);
  const extras = (extraAdults * room.extraAdultPrice + extraChildren * room.extraChildPrice) * nights;
  const roomSubtotal = room.price * nights;
  return { extras, grandTotal: roomSubtotal + extras, roomSubtotal };
}

const cases = [[2, 1], [2, 2], [3, 1], [3, 2], [4, 2], [3, 0], [2, 3]];
let failed = 0;

const expect = {
  "super-deluxe-twin": {
    "2,1": { show: true, extras: 0 },
    "2,2": { show: true, extras: 5 },
    "3,1": { show: true, extras: 5 },
    "3,2": { show: true, extras: 10 },
    "4,2": { show: false },
    "3,0": { show: true, extras: 5 },
    "2,3": { show: false },
  },
  "super-deluxe": {
    "2,1": { show: true, extras: 0 },
    "2,2": { show: true, extras: 5 },
    "3,1": { show: true, extras: 5 },
    "3,2": { show: true, extras: 10 },
    "4,2": { show: false },
    "3,0": { show: true, extras: 5 },
    "2,3": { show: false },
  },
  "family-room": {
    "2,1": { show: true, extras: 0 },
    "2,2": { show: true, extras: 0 },
    "3,1": { show: true, extras: 0 },
    "3,2": { show: true, extras: 0 },
    "4,2": { show: true, extras: 0 },
    "3,0": { show: true, extras: 0 },
    "2,3": { show: false },
  },
  "standard-deluxe": {
    "2,1": { show: true, extras: 0 },
    "2,2": { show: true, extras: 5 },
    "3,1": { show: false },
    "3,2": { show: false },
    "4,2": { show: false },
    "3,0": { show: false },
    "2,3": { show: false },
  },
};

for (const [id, room] of Object.entries(DEFAULT)) {
  console.log(`\n== ${id} ==`);
  for (const [a, c] of cases) {
    const key = `${a},${c}`;
    const show = fits(room, a, c);
    const b = breakdown(room, a, c);
    const exp = expect[id][key];
    const okShow = show === exp.show;
    const okExtras = !exp.show || b.extras === exp.extras;
    const ok = okShow && okExtras;
    if (!ok) failed += 1;
    console.log(
      `${a}A ${c}C → ${show ? "SHOW" : "HIDE"} extras=$${b.extras} total=$${b.grandTotal} ${ok ? "OK" : "FAIL"}`
    );
  }
}

console.log(failed ? `\nFAILED ${failed} checks` : "\nAll occupancy/pricing checks passed.");
process.exit(failed ? 1 : 0);
