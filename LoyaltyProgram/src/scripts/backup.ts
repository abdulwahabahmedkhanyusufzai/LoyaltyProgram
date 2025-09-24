import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  try {
    const backupDir = path.join(process.cwd(), "db-backup");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    const tables: { name: string; fetch: () => Promise<any[]> }[] = [
      { name: "Offer", fetch: () => prisma.offer.findMany() },
      { name: "OfferRedemption", fetch: () => prisma.offerRedemption.findMany() },
      { name: "User", fetch: () => prisma.user.findMany() },
      { name: "Shop", fetch: () => prisma.shop.findMany() },
      { name: "PointsLedger", fetch: () => prisma.pointsLedger.findMany() },
      { name: "WalletCredit", fetch: () => prisma.walletCredit.findMany() },
      { name: "LoyaltyLevel", fetch: () => prisma.loyaltyLevel.findMany() },
      { name: "PointRule", fetch: () => prisma.pointRule.findMany() },
      { name: "Campaign", fetch: () => prisma.campaign.findMany() },
      { name: "LoyaltyProgram", fetch: () => prisma.loyaltyProgram.findMany() },
      { name: "Customer", fetch: () => prisma.customer.findMany() },
    ];

    for (const table of tables) {
      const data = await table.fetch();
      const filePath = path.join(backupDir, `${table.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      console.log(`✅ Backup saved for table: ${table.name} (${data.length} records)`);
    }

    console.log("🎉 Backup completed!");
  } catch (err) {
    console.error("❌ Backup failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
