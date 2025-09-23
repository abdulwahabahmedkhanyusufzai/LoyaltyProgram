import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const backup = JSON.parse(fs.readFileSync("backup.json", "utf-8"));

  // Restore Users
  if (backup.users && backup.users.length) {
    await prisma.user.createMany({
      data: backup.users,
      skipDuplicates: true,
    });
    console.log(`✅ Restored ${backup.users.length} users`);
  }

  // Restore Customers
  if (backup.customers && backup.customers.length) {
    await prisma.customer.createMany({
      data: backup.customers,
      skipDuplicates: true,
    });
    console.log(`✅ Restored ${backup.customers.length} customers`);
  }

  // Restore PointsLedger
  if (backup.pointsLedger && backup.pointsLedger.length) {
    await prisma.pointsLedger.createMany({
      data: backup.pointsLedger,
      skipDuplicates: true,
    });
    console.log(`✅ Restored ${backup.pointsLedger.length} pointsLedger entries`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
