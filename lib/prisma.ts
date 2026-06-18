import { PrismaClient } from "@prisma/client";

import { envFlags } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  envFlags.databaseConfigured
    ? globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
      })
    : null;

if (prisma && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
