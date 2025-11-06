import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const runLoyaltyCronJob = async () => {
  try {
    const customers = await prisma.customer.findMany({
      where: { numberOfOrders: { gt: 0 } },
      include: {
        pointsLedger: {
          orderBy: { earnedAt: "desc" },
          take: 1, // 🚀 only fetch last entry instead of all
        },
      },
    });

    console.log(`🧾 Found ${customers.length} customers`);

    for (const customer of customers) {
      const amountSpent = Number(customer.amountSpent || 0);
      const lastEntry = customer.pointsLedger[0];
      const currentBalance = lastEntry?.balanceAfter || 0;

      // Determine tier + multiplier
      let tier = "Welcomed";
      let multiplier = 1;

      if (amountSpent >= 200 && amountSpent < 500) {
        tier = "Bronze";
      } else if (amountSpent >= 500 && amountSpent < 750) {
        tier = "Silver";
        multiplier = 1.5;
      } else if (amountSpent >= 750) {
        tier = "Gold";
        multiplier = 2;
      }

      const totalPoints = Math.floor(amountSpent * multiplier);

      // 🧠 Only update if points changed or tier changed
      const shouldUpdate =
        customer.loyaltyTitle !== tier || totalPoints !== currentBalance;

      if (!shouldUpdate) {
        console.log(`ℹ️ Skipped ${customer.firstName} (${tier}) — already up-to-date`);
        continue;
      }

      // Update customer + ledger
      await prisma.$transaction([
        prisma.customer.update({
          where: { id: customer.id },
          data: { loyaltyTitle: tier, updatedAt: new Date() },
        }),
        prisma.pointsLedger.create({
          data: {
            customerId: customer.id,
            change: totalPoints - currentBalance,
            balanceAfter: totalPoints,
            reason: "Automatic Loyalty Update",
            sourceType: "CRON_JOB",
          },
        }),
      ]);

      console.log(`✅ Updated ${customer.firstName} → ${tier} (${totalPoints} pts)`);
    }

    console.log("🎯 Loyalty cron completed successfully.");
  } catch (error) {
    console.error("❌ Error in loyalty cron:", error);
  } finally {
    await prisma.$disconnect();
  }
};
