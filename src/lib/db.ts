import { PrismaClient } from "@prisma/client";

// Standard Next.js dev-mode singleton to avoid exhausting DB connections
// with hot-reload creating a new PrismaClient on every edit.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
