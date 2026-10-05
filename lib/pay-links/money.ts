import { getPublicAppUrl } from "@/lib/email/config";

export const PAY_LINK_STATUSES = [
  "CREATED",
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
] as const;

export type PayLinkStatus = (typeof PAY_LINK_STATUSES)[number];
export type CardFeeType = "PERCENT" | "FIXED";

export const ACTIVE_PAY_LINK_ATTEMPT_STATUSES = ["initiated", "redirected"] as const;

const MIN_BASE_CENTS = 50;
const MAX_TOTAL_CENTS = 5_000_000;
const MAX_PERCENT_HUNDREDTHS = 2000; // 20.00%
const MAX_FIXED_FEE_CENTS = 500_000;

export function publicPayUrl(token: string): string {
  return `${getPublicAppUrl()}/pay/${encodeURIComponent(token)}`;
}

/** Integer USD cents from a 2-decimal money value. Rejects floats that are not exact cents. */
export function parseUsdToCents(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "object" && value !== null && "toFixed" in value) {
    return parseUsdToCents(String((value as { toFixed: (n: number) => string }).toFixed(2)));
  }
  const raw = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) return null;
  const [whole, frac = ""] = raw.split(".");
  const cents = Number.parseInt(whole, 10) * 100 + Number.parseInt(frac.padEnd(2, "0") || "0", 10);
  if (!Number.isSafeInteger(cents) || cents < 0) return null;
  return cents;
}

export function centsToUsdString(cents: number): string {
  if (!Number.isInteger(cents)) return "0.00";
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

export function formatUsdAmount(amount: unknown): string {
  const cents = parseUsdToCents(amount);
  if (cents == null) return "$0.00";
  return `$${centsToUsdString(cents)}`;
}

export function centsToMajorNumber(cents: number): number {
  return Number(centsToUsdString(cents));
}

/** @deprecated Use parseUsdToCents + computePayLinkQuote. Kept for display of legacy numeric fields. */
export function normalizeUsdAmount(value: unknown): number | null {
  const cents = parseUsdToCents(
    typeof value === "number" && Number.isFinite(value) ? value.toFixed(2) : value
  );
  if (cents == null || cents < MIN_BASE_CENTS || cents > MAX_TOTAL_CENTS) return null;
  return centsToMajorNumber(cents);
}

export function parsePercentHundredths(value: unknown): number | null {
  const centsLike = parseUsdToCents(typeof value === "number" ? value.toFixed(2) : value);
  if (centsLike == null || centsLike <= 0 || centsLike > MAX_PERCENT_HUNDREDTHS) return null;
  return centsLike;
}

export type PayLinkQuote = {
  baseCents: number;
  feeCents: number;
  totalCents: number;
  cardFeeEnabled: boolean;
  cardFeeType: CardFeeType | "";
  cardFeeValue: string;
  subtotalUsd: string;
  feeUsd: string;
  totalUsd: string;
};

export function computePayLinkQuote(input: {
  baseAmount: unknown;
  cardFeeEnabled?: boolean;
  cardFeeType?: string;
  cardFeeValue?: unknown;
}): { ok: true; quote: PayLinkQuote } | { ok: false; error: string } {
  const baseRaw =
    typeof input.baseAmount === "number" && Number.isFinite(input.baseAmount)
      ? input.baseAmount.toFixed(2)
      : input.baseAmount;
  const baseCents = parseUsdToCents(baseRaw);
  if (baseCents == null || baseCents < MIN_BASE_CENTS || baseCents > MAX_TOTAL_CENTS) {
    return { ok: false, error: "Enter a valid USD amount between $0.50 and $50,000.00." };
  }

  if (!input.cardFeeEnabled) {
    return {
      ok: true,
      quote: {
        baseCents,
        feeCents: 0,
        totalCents: baseCents,
        cardFeeEnabled: false,
        cardFeeType: "",
        cardFeeValue: "0.00",
        subtotalUsd: centsToUsdString(baseCents),
        feeUsd: "0.00",
        totalUsd: centsToUsdString(baseCents),
      },
    };
  }

  const type = String(input.cardFeeType || "").toUpperCase();
  if (type !== "PERCENT" && type !== "FIXED") {
    return { ok: false, error: "Choose percentage or fixed card fee." };
  }

  let feeCents = 0;
  let cardFeeValue = "0.00";

  if (type === "PERCENT") {
    const hundredths = parsePercentHundredths(input.cardFeeValue);
    if (hundredths == null) {
      return { ok: false, error: "Enter a card fee between 0.01% and 20.00%." };
    }
    cardFeeValue = centsToUsdString(hundredths);
    const numer = BigInt(baseCents) * BigInt(hundredths);
    feeCents = Number((numer + BigInt(5000)) / BigInt(10000));
  } else {
    const fixedRaw =
      typeof input.cardFeeValue === "number" && Number.isFinite(input.cardFeeValue)
        ? input.cardFeeValue.toFixed(2)
        : input.cardFeeValue;
    const fixed = parseUsdToCents(fixedRaw);
    if (fixed == null || fixed <= 0 || fixed > MAX_FIXED_FEE_CENTS) {
      return { ok: false, error: "Enter a valid fixed card fee in USD." };
    }
    feeCents = fixed;
    cardFeeValue = centsToUsdString(fixed);
  }

  const totalCents = baseCents + feeCents;
  if (totalCents < MIN_BASE_CENTS || totalCents > MAX_TOTAL_CENTS) {
    return { ok: false, error: "Customer total must be between $0.50 and $50,000.00." };
  }
  if (baseCents + feeCents !== totalCents) {
    return { ok: false, error: "Fee calculation failed." };
  }

  return {
    ok: true,
    quote: {
      baseCents,
      feeCents,
      totalCents,
      cardFeeEnabled: true,
      cardFeeType: type,
      cardFeeValue,
      subtotalUsd: centsToUsdString(baseCents),
      feeUsd: centsToUsdString(feeCents),
      totalUsd: centsToUsdString(totalCents),
    },
  };
}

export function decimalToCents(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return parseUsdToCents(value.toFixed(2));
  }
  return parseUsdToCents(String(value));
}

export function inquiryAmountToCents(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return parseUsdToCents(value.toFixed(2));
}

export function inquiryMayMarkPaid(opts: {
  outcomePaid: boolean;
  inquiryAmount: unknown;
  inquiryCurrency: unknown;
  attemptAmount: unknown;
  linkTotal: unknown;
}): { ok: true; inquiryCents: number } | { ok: false; reason: string } {
  if (!opts.outcomePaid) return { ok: false, reason: "not_paid" };
  const inquiryCents = inquiryAmountToCents(opts.inquiryAmount);
  if (inquiryCents == null) return { ok: false, reason: "missing_amount" };
  const currency = String(opts.inquiryCurrency || "").trim().toUpperCase();
  if (!currency) return { ok: false, reason: "missing_currency" };
  if (currency !== "USD") return { ok: false, reason: "currency" };
  const attemptCents = decimalToCents(opts.attemptAmount);
  const totalCents = decimalToCents(opts.linkTotal);
  if (attemptCents == null || totalCents == null) return { ok: false, reason: "missing_record_amount" };
  if (attemptCents !== totalCents) return { ok: false, reason: "attempt_total_mismatch" };
  if (inquiryCents !== totalCents) return { ok: false, reason: "amount_mismatch" };
  return { ok: true, inquiryCents };
}

export function isTerminalPaid(status: string): boolean {
  return status === "PAID";
}

export function hasActiveGatewayLock(status: string): boolean {
  return status === "PENDING" || status === "PROCESSING";
}

export function canEditNonFinancial(status: string): boolean {
  return status === "CREATED" || status === "PENDING" || status === "FAILED" || status === "PROCESSING";
}

export function canEditFinancialFields(status: string, hasActiveAttempt: boolean): boolean {
  if (status === "PAID" || status === "CANCELLED" || status === "EXPIRED") return false;
  if (hasActiveAttempt) return false;
  if (status === "PROCESSING") return false;
  return status === "CREATED" || status === "FAILED" || status === "PENDING";
}

export function canCollectPayment(status: string, expiresAt?: Date | null): boolean {
  if (status === "PAID" || status === "CANCELLED" || status === "EXPIRED") return false;
  if (expiresAt && expiresAt.getTime() <= Date.now()) return false;
  return true;
}

export function sanitizePayLinkImageUrl(pathOrUrl: string): string | null {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) return "";
  let pathname = raw.split("?")[0].split("#")[0];
  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      const allowed = new URL(getPublicAppUrl());
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
      if (parsed.hostname.toLowerCase() !== allowed.hostname.toLowerCase()) return null;
      if (parsed.username || parsed.password) return null;
      pathname = parsed.pathname;
    } catch {
      return null;
    }
  }
  if (!pathname.startsWith("/uploads/")) return null;
  if (pathname.includes("..") || pathname.includes("//")) return null;
  if (!/^\/uploads\/[a-zA-Z0-9/_-]+\.(jpe?g|png|webp)$/i.test(pathname)) return null;
  return pathname;
}

export function absoluteAssetUrl(pathOrUrl: string): string {
  const safe = sanitizePayLinkImageUrl(pathOrUrl);
  if (!safe) return "";
  const base = getPublicAppUrl();
  return `${base}${safe}`;
}

export function sharePayLinkMessage(link: {
  customerName: string;
  title: string;
  publicUrl: string;
  publicToken?: string;
  cardFeeEnabled?: boolean;
  amountUsd?: unknown;
  subtotalAmountUsd?: unknown;
  cardFeeAmount?: unknown;
  totalAmountUsd?: unknown;
}): string {
  const total = formatUsdAmount(link.totalAmountUsd ?? link.amountUsd);
  const reference = String(link.publicToken || "").trim();
  const lines = [
    "Payment Request – Hotel Thamel Park & Spa",
    "",
    `Hello ${link.customerName},`,
    "",
    "You have received a payment request from Hotel Thamel Park & Spa.",
    "",
    "Payment:",
    link.title,
    "Amount:",
    `${total} USD`,
  ];
  if (link.cardFeeEnabled) {
    lines.push(`Includes card processing fee of ${formatUsdAmount(link.cardFeeAmount)} USD.`);
  }
  lines.push(
    "Payment Reference:",
    reference || link.publicUrl,
    "Please complete your secure payment using the link below:",
    link.publicUrl,
    "",
    "Thank you,",
    "Hotel Thamel Park & Spa"
  );
  return lines.join("\n");
}
