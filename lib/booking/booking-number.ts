/**
 * Public booking reference shown to guests / on PDFs / in emails.
 * Serial: HTP01001, HTP01002, … derived from DB id (id 1 → HTP01001).
 */
export function formatBookingNumber(id: number): string {
  const n = Math.max(1, Math.floor(Number(id) || 0));
  return `HTP${String(n + 1000).padStart(5, "0")}`;
}

/** Parse HTP01001 → numeric DB id (or null). */
export function parseBookingNumber(code: string): number | null {
  const m = String(code || "")
    .trim()
    .toUpperCase()
    .match(/^HTP0*(\d+)$/);
  if (!m) return null;
  const serial = Number(m[1]);
  if (!Number.isFinite(serial) || serial < 1001) return null;
  return serial - 1000;
}
