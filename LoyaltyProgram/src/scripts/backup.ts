import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearLoyaltyPoints() {
  try {
    await prisma.pointsLedger.deleteMany(); // Deletes all rows
    console.log("✅ All data inside LOYALTYPOINTS deleted successfully.");
  } catch (error) {
    console.error("❌ Error deleting loyalty points:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearLoyaltyPoints();
