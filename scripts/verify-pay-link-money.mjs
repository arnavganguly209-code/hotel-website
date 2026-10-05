import assert from "node:assert/strict";

function parseUsdToCents(value) {
  const raw = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) return null;
  const [whole, frac = ""] = raw.split(".");
  return Number.parseInt(whole, 10) * 100 + Number.parseInt(frac.padEnd(2, "0") || "0", 10);
}

function centsToUsdString(cents) {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}

function compute(base, enabled, type, fee) {
  const baseCents = parseUsdToCents(base);
  if (!enabled) return { feeUsd: "0.00", totalUsd: centsToUsdString(baseCents) };
  let feeCents = 0;
  if (type === "PERCENT") {
    const hundredths = parseUsdToCents(fee);
    feeCents = Number((BigInt(baseCents) * BigInt(hundredths) + BigInt(5000)) / BigInt(10000));
  } else {
    feeCents = parseUsdToCents(fee);
  }
  return { feeUsd: centsToUsdString(feeCents), totalUsd: centsToUsdString(baseCents + feeCents) };
}

function mayPaid({ outcomePaid, inquiryAmount, inquiryCurrency, attemptAmount, linkTotal }) {
  if (!outcomePaid) return { ok: false, reason: "not_paid" };
  if (typeof inquiryAmount !== "number") return { ok: false, reason: "missing_amount" };
  const inquiryCents = parseUsdToCents(inquiryAmount.toFixed(2));
  const currency = String(inquiryCurrency || "").toUpperCase();
  if (!currency) return { ok: false, reason: "missing_currency" };
  if (currency !== "USD") return { ok: false, reason: "currency" };
  const attemptCents = parseUsdToCents(attemptAmount);
  const totalCents = parseUsdToCents(linkTotal);
  if (inquiryCents !== totalCents) return { ok: false, reason: "amount_mismatch" };
  if (attemptCents !== totalCents) return { ok: false, reason: "attempt_total_mismatch" };
  return { ok: true };
}

assert.equal(compute("100.00", false).totalUsd, "100.00");
assert.equal(compute("100.00", true, "PERCENT", "3.00").totalUsd, "103.00");
assert.equal(compute("100.00", true, "PERCENT", "3.00").feeUsd, "3.00");
assert.equal(compute("100.00", true, "FIXED", "5.00").totalUsd, "105.00");
assert.equal(compute("499.99", true, "PERCENT", "3.00").feeUsd, "15.00");
assert.equal(compute("499.99", true, "PERCENT", "3.00").totalUsd, "514.99");
assert.equal(mayPaid({ outcomePaid: true, inquiryAmount: 100, inquiryCurrency: "USD", attemptAmount: "105.00", linkTotal: "105.00" }).ok, false);
assert.equal(mayPaid({ outcomePaid: true, inquiryAmount: undefined, inquiryCurrency: "USD", attemptAmount: "105.00", linkTotal: "105.00" }).reason, "missing_amount");
assert.equal(mayPaid({ outcomePaid: true, inquiryAmount: 105, inquiryCurrency: "USD", attemptAmount: "105.00", linkTotal: "105.00" }).ok, true);
console.log("pay-link money tests: PASS");
