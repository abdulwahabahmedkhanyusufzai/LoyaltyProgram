import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function runOfferCronJob() {
  console.log("🚀 Running offer cron job...");


  // Fetch all customers with their orders
  // const customers = await prisma.customer.findMany({
  //   include: {
  //     orders: {
  //       select: {
  //         id: true,
  //         totalAmount: true,
  //         currency: true,
  //         pointsEarned: true,
  //       },
  //     },
  //     pointsLedger: {
  //       select: { balanceAfter: true },
  //       orderBy: { earnedAt: "desc" },
  //       take: 1,
  //     },
  //   },
  // });

  // let updatedCount = 0;

  // for (const customer of customers) {
  //   if (!customer.orders || customer.orders.length === 0) continue;

  //   // Total spent in EUR
  //   const totalSpent = customer.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  //   // 1 point per €10 spent
  //   const totalPoints = Math.floor(totalSpent / 10);

  //   // Get current balance (last ledger entry if any)
  //   const lastBalance = customer.pointsLedger[0]?.balanceAfter || 0;

  //   // Calculate how many new points to add
  //   const newPointsToAdd = totalPoints - lastBalance;

  //   if (newPointsToAdd <= 0) continue; // nothing new to add

  //   // Create new ledger entry
  //   await prisma.pointsLedger.create({
  //     data: {
  //       customerId: customer.id,
  //       change: newPointsToAdd,
  //       balanceAfter: lastBalance + newPointsToAdd,
  //       reason: "auto.daily_spending_points",
  //       sourceType: "order",
  //     },
  //   });

  //   // Update customer's total amountSpent & loyaltyTitle if needed
  //   await prisma.customer.update({
  //     where: { id: customer.id },
  //     data: {
  //       amountSpent: totalSpent,
  //       updatedAt: new Date(),
  //     },
  //   });

  //   updatedCount++;
  // }
  console.log("🚀 Running offer cron job...");

  const customers = await prisma.customer.findMany({
    where:{
      numberOfOrders:{gt:0},
    },
});

  // Log them clearly
  console.log(`🧾 Found ${customers.length} customers:`);
  console.log(JSON.stringify(customers, null, 2)); // pretty print

  console.log("🏁 Offer job complete.");
  return customers.length;
}
