import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Get the first customer
  const customer = await prisma.customer.findFirst({
    include: {
      orders: true,
      pointsLedger: true,
    },
  });

  if (!customer) {
    console.log("No customers found.");
    return;
  }

  console.log("Customer:", customer.firstName, customer.lastName, customer.email);
  console.log("ID:", customer.id);
  
  console.log("\n--- Orders ---");
  customer.orders.forEach(o => {
    console.log(`Order #${o.orderNumber} - Total: ${o.totalAmount} - Date: ${o.createdAt}`);
  });

  console.log("\n--- Points Ledger ---");
  customer.pointsLedger.forEach(l => {
    console.log(`ID: ${l.id} - Date: ${l.earnedAt} - Type: ${l.sourceType} - Change: ${l.change} - Reason: ${l.reason}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
