import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/** Parse host from a PostgreSQL connection string without logging the URL. */
function databaseHost(connectionString: string): string {
  try {
    return new URL(connectionString).hostname || "";
  } catch {
    return (connectionString.match(/@([^/:?]+)/) || [])[1] || "";
  }
}

/** Parse database name from a PostgreSQL connection string. */
function databaseName(connectionString: string): string {
  try {
    const name = new URL(connectionString).pathname.replace(/^\//, "");
    return decodeURIComponent(name.split("/")[0] || "");
  } catch {
    const path = (connectionString.split("?")[0] || "").split("@")[1] || "";
    const slash = path.indexOf("/");
    return slash >= 0 ? decodeURIComponent(path.slice(slash + 1)) : "";
  }
}

/**
 * Hotel Thamel Park uses only VPS localhost PostgreSQL database `thamelpark`.
 * Reject every remote/hosted URL before a connection is attempted.
 */
export function assertLocalThamelparkDatabaseUrl(connectionString: string): void {
  const host = databaseHost(connectionString).toLowerCase();
  const name = databaseName(connectionString).toLowerCase();
  const isLocal = host === "127.0.0.1" || host === "localhost" || host === "::1";

  if (!isLocal) {
    throw new Error(
      'DATABASE_URL must use local PostgreSQL on 127.0.0.1 or localhost (database "thamelpark"). Remote database hosts are not supported.'
    );
  }
  if (name !== "thamelpark") {
    throw new Error('DATABASE_URL must target the local PostgreSQL database "thamelpark".');
  }
}

function resolveDatabaseUrl(): string {
  const fromEnv = (process.env.DATABASE_URL || "").trim();
  const connectionString =
    fromEnv || "postgresql://127.0.0.1:5432/thamelpark";
  assertLocalThamelparkDatabaseUrl(connectionString);
  return connectionString;
}

function createPrismaClient(): PrismaClient {
  const connectionString = resolveDatabaseUrl();
  const pool = new pg.Pool({
    connectionString,
    connectionTimeoutMillis: 8_000,
    idleTimeoutMillis: 30_000,
    max: 10,
  });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export function isDatabaseAvailable(): boolean {
  const url = (process.env.DATABASE_URL || "").trim();
  if (!url) return false;
  try {
    assertLocalThamelparkDatabaseUrl(url);
    return true;
  } catch {
    return false;
  }
}
