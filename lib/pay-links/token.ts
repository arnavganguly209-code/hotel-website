import { randomBytes } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generatePayLinkToken(): string {
  const bytes = randomBytes(8);
  let body = "";
  for (const b of bytes) {
    body += ALPHABET[b % ALPHABET.length];
  }
  return `HTP-${body}`;
}

export function isPayLinkToken(value: string): boolean {
  return /^HTP-[A-Z0-9]{8,16}$/i.test(String(value || "").trim());
}
