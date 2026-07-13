import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

export type CloudinaryResourceType = "image" | "video" | "raw";

export interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  source: "env_vars" | "cloudinary_url";
}

export interface CloudinaryDebugInfo {
  cloudName: string;
  apiKeySuffix: string;
  credentialSource: CloudinaryCredentials["source"];
  hasCloudinaryUrl: boolean;
  hasIndividualVars: boolean;
  secretLength: number;
  credentialConflict: boolean;
}

export interface CloudinarySafeLog {
  cloudName: string;
  apiKeySuffix: string;
  folder?: string;
  timestamp: number;
  credentialSource: CloudinaryCredentials["source"];
}

/** Shared SDK + credentials — one resolver for upload, delete, replace, and health checks. */
export interface CloudinaryContext {
  sdk: typeof cloudinary;
  creds: CloudinaryCredentials;
  auth: {
    cloud_name: string;
    api_key: string;
    api_secret: string;
  };
}

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function stripEnvValue(value: string): string {
  return stripQuotes(value).replace(/[\r\n]+$/g, "");
}

function parseCloudinaryUrl(url: string): Omit<CloudinaryCredentials, "source"> {
  const normalized = url.trim();
  if (!normalized.toLowerCase().startsWith("cloudinary://")) {
    throw new Error("CLOUDINARY_URL must start with cloudinary://");
  }

  const parsed = new URL(normalized);
  const cloudName = parsed.hostname;
  const apiKey = decodeURIComponent(parsed.username || "");
  const apiSecret = decodeURIComponent(parsed.password || "");

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("CLOUDINARY_URL is missing cloud name, API key, or API secret");
  }

  return { cloudName, apiKey, apiSecret };
}

function validateSecret(apiSecret: string, label: string): void {
  if (apiSecret.length < 8) {
    throw new Error(
      `${label} appears invalid (too short). Copy the full API secret from the Cloudinary dashboard.`
    );
  }
}

function looksLikeApiKey(value: string): boolean {
  return /^\d{10,20}$/.test(value);
}

function looksLikeApiSecret(value: string): boolean {
  return value.length >= 16 && /[a-zA-Z]/.test(value);
}

function normalizeCredentialPair(apiKey: string, apiSecret: string): { apiKey: string; apiSecret: string } {
  if (looksLikeApiSecret(apiKey) && looksLikeApiKey(apiSecret)) {
    console.warn("[Cloudinary] CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET appear swapped — auto-correcting.");
    return { apiKey: apiSecret, apiSecret: apiKey };
  }
  return { apiKey, apiSecret };
}

function detectCredentialConflict(): boolean {
  const cloudName = stripEnvValue(process.env.CLOUDINARY_CLOUD_NAME ?? "");
  const apiKey = stripEnvValue(process.env.CLOUDINARY_API_KEY ?? "");
  const apiSecret = stripEnvValue(process.env.CLOUDINARY_API_SECRET ?? "");
  const hasIndividual = Boolean(cloudName && apiKey && apiSecret);
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();

  if (!hasIndividual || !cloudinaryUrl) return false;

  try {
    const fromUrl = parseCloudinaryUrl(cloudinaryUrl);
    return fromUrl.apiSecret !== apiSecret || fromUrl.apiKey !== apiKey || fromUrl.cloudName !== cloudName;
  } catch {
    return false;
  }
}

/**
 * Single credential resolver.
 * Priority: all three individual env vars → CLOUDINARY_URL → error.
 * When individual vars are set, CLOUDINARY_URL is ignored (never used for signing).
 */
export function resolveCloudinaryCredentials(): CloudinaryCredentials {
  const cloudName = stripEnvValue(process.env.CLOUDINARY_CLOUD_NAME ?? "");
  const apiKey = stripEnvValue(process.env.CLOUDINARY_API_KEY ?? "");
  const apiSecret = stripEnvValue(process.env.CLOUDINARY_API_SECRET ?? "");
  const hasIndividual = Boolean(cloudName && apiKey && apiSecret);

  if (hasIndividual) {
    const normalized = normalizeCredentialPair(apiKey, apiSecret);
    validateSecret(normalized.apiSecret, "CLOUDINARY_API_SECRET");
    if (detectCredentialConflict()) {
      console.warn(
        "[Cloudinary] CLOUDINARY_URL differs from individual env vars — using CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET only. Remove CLOUDINARY_URL from Vercel to avoid confusion."
      );
    }
    return {
      cloudName,
      apiKey: normalized.apiKey,
      apiSecret: normalized.apiSecret,
      source: "env_vars",
    };
  }

  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
  if (cloudinaryUrl) {
    const fromUrl = parseCloudinaryUrl(cloudinaryUrl);
    validateSecret(fromUrl.apiSecret, "CLOUDINARY_URL API secret");
    return { ...fromUrl, source: "cloudinary_url" };
  }

  const missing: string[] = [];
  if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!apiKey) missing.push("CLOUDINARY_API_KEY");
  if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");

  if (missing.length > 0 && missing.length < 3) {
    throw new Error(
      `Incomplete Cloudinary config (missing: ${missing.join(", ")}). Set all three individual vars or use CLOUDINARY_URL only.`
    );
  }

  throw new Error(
    "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL)."
  );
}

export function getCloudinaryDebugInfo(): CloudinaryDebugInfo {
  try {
    const creds = resolveCloudinaryCredentials();
    return {
      cloudName: creds.cloudName,
      apiKeySuffix: creds.apiKey.slice(-4),
      credentialSource: creds.source,
      hasCloudinaryUrl: Boolean(process.env.CLOUDINARY_URL?.trim()),
      hasIndividualVars: Boolean(
        process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
          process.env.CLOUDINARY_API_KEY?.trim() &&
          process.env.CLOUDINARY_API_SECRET?.trim()
      ),
      secretLength: creds.apiSecret.length,
      credentialConflict: detectCredentialConflict(),
    };
  } catch {
    return {
      cloudName: "",
      apiKeySuffix: "",
      credentialSource: "env_vars",
      hasCloudinaryUrl: Boolean(process.env.CLOUDINARY_URL?.trim()),
      hasIndividualVars: false,
      secretLength: 0,
      credentialConflict: false,
    };
  }
}

export function cloudinaryTimestamp(): number {
  return Math.round(Date.now() / 1000);
}

export function cloudinarySafeLog(
  creds: CloudinaryCredentials,
  folder?: string
): CloudinarySafeLog {
  return {
    cloudName: creds.cloudName,
    apiKeySuffix: creds.apiKey.slice(-4),
    folder,
    timestamp: cloudinaryTimestamp(),
    credentialSource: creds.source,
  };
}

function buildAuthOptions(creds: CloudinaryCredentials) {
  return {
    cloud_name: creds.cloudName,
    api_key: creds.apiKey,
    api_secret: creds.apiSecret,
  };
}

/**
 * Single entry point — resolves credentials, configures the SDK once per call,
 * and returns the shared instance used for upload, delete, replace, and ping.
 */
export function getCloudinary(): CloudinaryContext {
  const creds = resolveCloudinaryCredentials();
  const auth = buildAuthOptions(creds);

  // Block SDK auto-load of CLOUDINARY_URL so only resolved creds are used for signing.
  const savedUrl = process.env.CLOUDINARY_URL;
  if (savedUrl !== undefined) {
    delete process.env.CLOUDINARY_URL;
  }

  cloudinary.config(true);
  cloudinary.config({ ...auth, secure: true });

  if (savedUrl !== undefined) {
    process.env.CLOUDINARY_URL = savedUrl;
  }

  return { sdk: cloudinary, creds, auth };
}

export async function verifyCloudinaryCredentials(): Promise<{
  ok: boolean;
  message: string;
  debug: CloudinaryDebugInfo;
}> {
  const debug = getCloudinaryDebugInfo();
  try {
    const { sdk, creds, auth } = getCloudinary();
    console.info("[Cloudinary] Credential check", cloudinarySafeLog(creds));
    await sdk.api.ping();
    return { ok: true, message: "Cloudinary credentials verified", debug };
  } catch (error) {
    const formatted = formatUploadError(error);
    return { ok: false, message: formatted.message, debug };
  }
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com/");
}

export function publicIdFromUrl(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    const afterUpload = parts.slice(uploadIndex + 1);
    const withoutVersion =
      afterUpload[0]?.startsWith("v") && /^\d+$/.test(afterUpload[0].slice(1))
        ? afterUpload.slice(1)
        : afterUpload;
    const joined = withoutVersion.join("/");
    const lastDot = joined.lastIndexOf(".");
    return lastDot === -1 ? joined : joined.slice(0, lastDot);
  } catch {
    return null;
  }
}

export async function uploadCloudinaryBuffer(
  buffer: Buffer,
  options: {
    folder: string;
    resourceType: CloudinaryResourceType;
    mimeType: string;
  }
): Promise<UploadApiResponse> {
  const { sdk, creds, auth } = getCloudinary();
  const folder = options.folder.trim() || "uploads";
  const timestamp = cloudinaryTimestamp();

  console.info("[Cloudinary] Upload start", {
    ...cloudinarySafeLog(creds, folder),
    timestamp,
    resourceType: options.resourceType,
    bytes: buffer.length,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = sdk.uploader.upload_stream(
      {
        ...auth,
        folder,
        resource_type: options.resourceType,
        use_filename: false,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          console.error("[Cloudinary] Upload failed", {
            ...cloudinarySafeLog(creds, folder),
            timestamp,
            message: error instanceof Error ? error.message : String(error),
          });
          reject(error ?? new Error("Cloudinary upload returned no result"));
          return;
        }
        console.info("[Cloudinary] Upload success", {
          ...cloudinarySafeLog(creds, folder),
          timestamp,
          publicId: result.public_id,
          version: result.version,
        });
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: CloudinaryResourceType = "image"
): Promise<void> {
  const { sdk, creds, auth } = getCloudinary();
  const timestamp = cloudinaryTimestamp();

  console.info("[Cloudinary] Delete start", {
    ...cloudinarySafeLog(creds),
    timestamp,
    publicId,
    resourceType,
  });

  await sdk.uploader.destroy(publicId, {
    ...auth,
    resource_type: resourceType,
    invalidate: true,
  });

  console.info("[Cloudinary] Delete success", {
    ...cloudinarySafeLog(creds),
    timestamp,
    publicId,
  });
}

export async function deleteCloudinaryByUrl(
  url: string,
  resourceType: CloudinaryResourceType = "image"
): Promise<void> {
  const publicId = publicIdFromUrl(url);
  if (!publicId) return;
  try {
    await deleteCloudinaryAsset(publicId, resourceType);
  } catch (error) {
    console.warn("[Cloudinary] Failed to delete asset:", publicId, error);
  }
}

export function formatUploadError(error: unknown): {
  message: string;
  code: string;
  debug: CloudinaryDebugInfo;
} {
  const debug = getCloudinaryDebugInfo();
  const err = error as { message?: string; http_code?: number; name?: string };
  const message = err?.message ?? "Upload failed";
  const isSignature =
    message.toLowerCase().includes("invalid signature") ||
    message.toLowerCase().includes("signature");

  let hint = message;
  if (isSignature) {
    hint =
      "Cloudinary rejected the upload signature. Verify CLOUDINARY_API_SECRET matches the API key and cloud name in your Cloudinary dashboard.";
    if (debug.credentialConflict) {
      hint +=
        " CLOUDINARY_URL conflicts with individual env vars — remove CLOUDINARY_URL from Vercel or use only CLOUDINARY_URL.";
    }
  }

  return {
    message: hint,
    code: isSignature ? "INVALID_SIGNATURE" : err?.name ?? "UPLOAD_FAILED",
    debug,
  };
}
