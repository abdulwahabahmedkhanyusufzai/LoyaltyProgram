import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  try {
    const backupDir = path.join(process.cwd(), "db-backup");
    if (!fs.existsSync(backupDir)) throw new Error("Backup folder not found!");

    const tables: { name: string; model: any }[] = [
      { name: "Offer", model: prisma.offer },
      { name: "OfferRedemption", model: prisma.offerRedemption },
      { name: "User", model: prisma.user },
      { name: "Shop", model: prisma.shop },
      { name: "Customer", model: prisma.customer },
      { name: "PointsLedger", model: prisma.pointsLedger },
      { name: "WalletCredit", model: prisma.walletCredit },
      { name: "LoyaltyLevel", model: prisma.loyaltyLevel },
      { name: "PointRule", model: prisma.pointRule },
      { name: "Campaign", model: prisma.campaign },
      { name: "LoyaltyProgram", model: prisma.loyaltyProgram },
   
    ];

    for (const table of tables) {
      const filePath = path.join(backupDir, `${table.name}.json`);
      if (!fs.existsSync(filePath)) continue;

      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (!Array.isArray(data) || data.length === 0) continue;

      console.log(`💾 Restoring table: ${table.name} (${data.length} records)`);

      for (const record of data) {
        try {
          // Upsert using primary key (id) if exists
          await table.model.upsert({
            where: { id: record.id },
            update: record,
            create: record,
          });
        } catch (err) {
          console.error(`⚠️ Failed to restore record in ${table.name}:`, err);
        }
      }
    }

    console.log("🎉 Restore completed!");
  } catch (err) {
    console.error("❌ Restore failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
