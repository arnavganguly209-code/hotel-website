#!/usr/bin/env node
/**
 * Unit checks for PACO amount/currency consistency (no network, no secrets).
 * Mirrors lib/payments/paco/currency.ts — keep in sync when changing amountText rules.
 */
import assert from "node:assert/strict";

function normalizePacoCurrency(raw) {
  const c = String(raw || "").trim().toUpperCase();
  if (c === "USD" || c === "NPR") return c;
  throw new Error(`Unsupported PACO currency "${raw || ""}"`);
}

function toPacoMinorUnits(amount) {
  if (!Number.isFinite(amount) || amount < 0) throw new Error(`Invalid amount: ${amount}`);
  const cents = Math.round(Number((amount + Number.EPSILON).toFixed(2)) * 100);
  if (cents <= 0) throw new Error(`PACO amount must be > 0 (got ${amount})`);
  return cents;
}

function formatPacoAmountFields(amount, currencyCode) {
  const currency = normalizePacoCurrency(currencyCode);
  const minor = toPacoMinorUnits(amount);
  return {
    amountText: String(minor).padStart(12, "0"),
    currencyCode: currency,
    decimalPlaces: 2,
    amount: minor / 100,
  };
}

function assertSameMoney(a, b, label) {
  if (a.currencyCode !== b.currencyCode) {
    throw new Error(`${label}: currency mismatch`);
  }
  if (a.amountText !== b.amountText || a.amount !== b.amount) {
    throw new Error(`${label}: amount mismatch`);
  }
}

function ok(label) {
  console.log("OK:", label);
}

assert.equal(normalizePacoCurrency("usd"), "USD");
assert.equal(normalizePacoCurrency("NPR"), "NPR");
assert.throws(() => normalizePacoCurrency("THB"));
ok("normalizePacoCurrency");

const usd60 = formatPacoAmountFields(60, "USD");
assert.deepEqual(usd60, {
  amountText: "000000006000",
  currencyCode: "USD",
  decimalPlaces: 2,
  amount: 60,
});
ok("USD 60 → amountText 000000006000");

const npr1 = formatPacoAmountFields(1, "NPR");
assert.equal(npr1.amountText, "000000000100");
assert.equal(npr1.currencyCode, "NPR");
ok("NPR 1 → amountText 000000000100");

assert.throws(() => formatPacoAmountFields(0, "USD"));
assert.throws(() => formatPacoAmountFields(-1, "USD"));
ok("rejects zero/negative");

const txn = formatPacoAmountFields(60, "USD");
assertSameMoney(txn, { ...txn }, "mirror");
assert.throws(() => assertSameMoney(txn, formatPacoAmountFields(1, "NPR"), "bad"));
ok("assertSameMoney blocks NPR vs USD");

// Static source guard: live client must not hard-code NPR purchase items
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientSrc = fs.readFileSync(path.join(root, "lib/payments/paco/client.ts"), "utf8");
if (/purchaseItemPrice:\s*\{[^}]*currencyCode:\s*["']NPR["']/.test(clientSrc)) {
  throw new Error("client.ts still hard-codes NPR in purchaseItemPrice");
}
if (/HBL_PACO_SDK_DEMO_SHAPE/.test(clientSrc) && /process\.env\.HBL_PACO_SDK_DEMO_SHAPE/.test(clientSrc)) {
  throw new Error("client.ts must not enable sdk demo via env on live path");
}
ok("client.ts has no hard-coded NPR purchaseItemPrice / no env demo shape");

console.log("\nAll PACO currency unit checks passed.");
