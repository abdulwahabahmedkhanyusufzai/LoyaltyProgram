// backup.ts
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany();
  const pointsLedger = await prisma.pointsLedger.findMany();
  const users = await prisma.user.findMany();

  const backup = { customers, pointsLedger, users };
  fs.writeFileSync("backup.json", JSON.stringify(backup, null, 2));

  console.log("Backup saved to backup.json");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
