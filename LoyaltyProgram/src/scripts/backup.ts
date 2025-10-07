import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const deleted = await prisma.customer.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} customers from the database.`);
  } catch (err) {
    console.error("❌ Error deleting customers:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
