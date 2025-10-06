import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  try {
    // Load backup file
    const data = JSON.parse(fs.readFileSync("./db-backup.json", "utf-8"));

    if (data.offers && data.offers.length) {
      for (const offer of data.offers) {
        await prisma.offer.upsert({
          where: { id: offer.id }, // match by ID
          update: {
            name: offer.name,
            description: offer.description,
            image: offer.image,
            offerType: offer.offerType,
            value: offer.value,
            pointsCost: offer.pointsCost,
            tierRequired: offer.tierRequired,
            usageLimit: offer.usageLimit,
            isActive: offer.isActive,
            startDate: new Date(offer.startDate),
            endDate: new Date(offer.endDate),
            updatedAt: new Date(offer.updatedAt),
          },
          create: {
            id: offer.id,
            name: offer.name,
            description: offer.description,
            image: offer.image,
            offerType: offer.offerType,
            value: offer.value,
            pointsCost: offer.pointsCost,
            tierRequired: offer.tierRequired,
            usageLimit: offer.usageLimit,
            isActive: offer.isActive,
            startDate: new Date(offer.startDate),
            endDate: new Date(offer.endDate),
            createdAt: new Date(offer.createdAt),
            updatedAt: new Date(offer.updatedAt),
            redemptions: {
              create: offer.redemptions?.map((r: any) => ({
                id: r.id,
                userId: r.userId,
                redeemedAt: new Date(r.redeemedAt),
                metadata: r.metadata,
              })),
            },
          },
        });
      }
    }

    console.log("Offers restored successfully!");
  } catch (err) {
    console.error("Error restoring offers:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
