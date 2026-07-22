import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is missing");
    }
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool as any);
    return new PrismaClient({ adapter });
  })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
