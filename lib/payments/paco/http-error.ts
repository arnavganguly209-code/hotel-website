import type { PacoConfig } from "./config";
import { inspectPacoJoseToken } from "./jose";

export type PacoHttpBodyFormat = "jwe" | "jws" | "json" | "html" | "text" | "empty";

export type PacoHttpDiagnostic = {
  httpStatus: number;
  bodyFormat: PacoHttpBodyFormat;
  bodyLength: number;
  decrypted: boolean | null;
  signatureVerified: boolean | null;
  claimsOk: boolean | null;
  joseStageError: string | null;
  responseCode: string | null;
  responseDescription: string | null;
  orderNo: string | null;
  version: string | null;
  status: string | null;
  message: string | null;
};

const SENSITIVE_KEY = /apiKey|accessToken|companyapikey|private|secret|password|authorization/i;

export function detectPacoBodyFormat(raw: string): PacoHttpBodyFormat {
  const t = raw.trim();
  if (!t) return "empty";
  if (/<!DOCTYPE/i.test(t) || /<html[\s>]/i.test(t) || t.startsWith("<")) return "html";
  if (t.startsWith("{") || t.startsWith("[")) return "json";
  const parts = t.split(".");
  const b64url = parts.every((p) => p.length > 0 && /^[A-Za-z0-9_-]+$/.test(p));
  if (parts.length === 5 && b64url) return "jwe";
  if (parts.length === 3 && b64url) return "jws";
  return "text";
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t ? t : null;
}

function pickField(obj: Record<string, unknown>, names: string[]): string | null {
  for (const name of names) {
    if (SENSITIVE_KEY.test(name)) continue;
    const v = asNonEmptyString(obj[name]);
    if (v) return v;
  }
  return null;
}

function walkExtract(value: unknown, acc: Record<string, string | null>, depth = 0): void {
  if (!value || typeof value !== "object" || depth > 8) return;
  if (Array.isArray(value)) {
    for (const item of value) walkExtract(item, acc, depth + 1);
    return;
  }
  const obj = value as Record<string, unknown>;
  acc.responseCode ||= pickField(obj, ["responseCode", "ResponseCode", "errorCode", "ErrorCode"]);
  acc.responseDescription ||= pickField(obj, [
    "responseDescription",
    "ResponseDescription",
    "errorDescription",
    "ErrorDescription",
    "description",
    "Description",
  ]);
  acc.orderNo ||= pickField(obj, ["orderNo", "OrderNo"]);
  acc.version ||= pickField(obj, ["version", "Version", "apiVersion"]);
  acc.status ||= pickField(obj, ["status", "Status", "responseStatus"]);
  acc.message ||= pickField(obj, ["message", "Message", "errorMessage", "ErrorMessage"]);
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEY.test(k)) continue;
    if (v && typeof v === "object") walkExtract(v, acc, depth + 1);
  }
}

function htmlSafeExcerpt(raw: string): string | null {
  const title = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const text = (title || raw)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  return text.slice(0, 180);
}

function emptyFields() {
  return {
    responseCode: null as string | null,
    responseDescription: null as string | null,
    orderNo: null as string | null,
    version: null as string | null,
    status: null as string | null,
    message: null as string | null,
  };
}

export async function diagnosePacoHttpError(
  httpStatus: number,
  rawBody: string,
  config: PacoConfig
): Promise<PacoHttpDiagnostic> {
  const body = typeof rawBody === "string" ? rawBody : "";
  const bodyFormat = detectPacoBodyFormat(body);
  const fields = emptyFields();
  const diagnostic: PacoHttpDiagnostic = {
    httpStatus,
    bodyFormat,
    bodyLength: body.length,
    decrypted: null,
    signatureVerified: null,
    claimsOk: null,
    joseStageError: null,
    ...fields,
  };

  if (bodyFormat === "jwe" || bodyFormat === "jws") {
    const inspected = await inspectPacoJoseToken(body, config);
    diagnostic.decrypted = inspected.decrypted;
    diagnostic.signatureVerified = inspected.signatureVerified;
    diagnostic.claimsOk = inspected.claimsOk;
    diagnostic.joseStageError = inspected.stageError;
    if (inspected.payloadJson) {
      try {
        walkExtract(JSON.parse(inspected.payloadJson), fields);
      } catch {
        diagnostic.message = "JOSE payload was not JSON";
      }
    }
    Object.assign(diagnostic, fields);
    return diagnostic;
  }

  if (bodyFormat === "json") {
    try {
      walkExtract(JSON.parse(body), fields);
    } catch {
      diagnostic.message = "JSON parse failed";
    }
    Object.assign(diagnostic, fields);
    return diagnostic;
  }

  if (bodyFormat === "html") {
    diagnostic.message = htmlSafeExcerpt(body);
    return diagnostic;
  }

  if (bodyFormat === "text") {
    const excerpt = body.replace(/\s+/g, " ").trim().slice(0, 180);
    diagnostic.message = excerpt || null;
  }
  return diagnostic;
}

export class PacoHttpError extends Error {
  readonly httpStatus: number;
  readonly diagnostic: PacoHttpDiagnostic;

  constructor(diagnostic: PacoHttpDiagnostic) {
    const code = diagnostic.responseCode ? ` responseCode=${diagnostic.responseCode}` : "";
    const desc = diagnostic.responseDescription
      ? ` responseDescription=${diagnostic.responseDescription}`
      : "";
    super(`PACO HTTP ${diagnostic.httpStatus}${code}${desc}`);
    this.name = "PacoHttpError";
    this.httpStatus = diagnostic.httpStatus;
    this.diagnostic = diagnostic;
  }
}

/** Flat fields safe to pass through pacoLog (no raw JOSE/JSON body, no credentials). */
export function pacoHttpDiagnosticLogFields(d: PacoHttpDiagnostic): Record<string, unknown> {
  return {
    httpStatus: d.httpStatus,
    bodyFormat: d.bodyFormat,
    bodyLength: d.bodyLength,
    decrypted: d.decrypted,
    signatureVerified: d.signatureVerified,
    claimsOk: d.claimsOk,
    decryptStageError: d.joseStageError,
    responseCode: d.responseCode,
    responseDescription: d.responseDescription,
    orderNo: d.orderNo,
    version: d.version,
    status: d.status,
    message: d.message,
  };
}
