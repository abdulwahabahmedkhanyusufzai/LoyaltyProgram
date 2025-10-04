import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` declarations in TS
  // so it doesn’t complain when we reuse it
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"], // optional logging
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
