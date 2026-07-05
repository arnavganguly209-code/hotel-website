import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ?? "postgresql://localhost:5432/postgres";
  const pool = new pg.Pool({ connectionString });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export function isDatabaseAvailable(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
