type Level = "info" | "warn" | "error";

/** Secure logger — never prints keys, full JOSE tokens, or card data. */
export function pacoLog(level: Level, event: string, meta?: Record<string, unknown>) {
  const safe: Record<string, unknown> = {};
  if (meta) {
    for (const [k, v] of Object.entries(meta)) {
      if (/key|token|jose|password|secret|private/i.test(k)) {
        safe[k] = "[redacted]";
        continue;
      }
      if (typeof v === "string" && /BEGIN (RSA )?PRIVATE KEY|BEGIN PUBLIC KEY/.test(v)) {
        safe[k] = "[redacted-pem]";
        continue;
      }
      if (typeof v === "string" && v.length > 500) {
        safe[k] = `${v.slice(0, 120)}…[${v.length} chars]`;
        continue;
      }
      safe[k] = v;
    }
  }
  const line = { ts: new Date().toISOString(), scope: "hbl-paco", event, ...safe };
  if (level === "error") console.error("[hbl-paco]", line);
  else if (level === "warn") console.warn("[hbl-paco]", line);
  else console.info("[hbl-paco]", line);
}
