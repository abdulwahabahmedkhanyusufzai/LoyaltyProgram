import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // 1️⃣ Delete points ledger entries
    const deletedLedger = await prisma.pointsLedger.deleteMany({});
    console.log(`✅ Deleted ${deletedLedger.count} points ledger entries.`);

    // 2️⃣ Delete orders
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`✅ Deleted ${deletedOrders.count} orders.`);

    // 3️⃣ Now delete customers
    const deletedCustomers = await prisma.customer.deleteMany({});
    console.log(`✅ Deleted ${deletedCustomers.count} customers.`);
  } catch (err) {
    console.error("❌ Error deleting data:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
