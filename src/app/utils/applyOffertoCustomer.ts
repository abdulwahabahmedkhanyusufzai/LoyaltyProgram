import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const runLoyaltyCronJob = async () => {
  try {
    const customers = await prisma.customer.findMany({
      where: { numberOfOrders: { gt: 0 } },
      include: { pointsLedger: true },
    });

    console.log(`🧾 Found ${customers.length} customers`);

    for (const customer of customers) {
      const amountSpent = Number(customer.amountSpent || 0);
      let newLoyaltyTitle = customer.loyaltyTitle;
      let multiplier = 1;

      // ---- Determine loyalty tier ----
      if (amountSpent < 200) {
        newLoyaltyTitle = "Welcomed";
        multiplier = 1;
      } else if (amountSpent >= 200 && amountSpent < 500) {
        newLoyaltyTitle = "Bronze";
        multiplier = 1;
      } else if (amountSpent >= 500 && amountSpent < 750) {
        newLoyaltyTitle = "Silver";
        multiplier = 1.5;
      } else {
        newLoyaltyTitle = "Gold";
        multiplier = 2;
      }

      // ---- Calculate total points ----
      const totalPoints = Math.floor(amountSpent * multiplier);

      // ---- Get last known balance from ledger ----
      const lastLedgerEntry = customer.pointsLedger.sort(
        (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
      )[0];
      const currentBalance = lastLedgerEntry?.balanceAfter || 0;

      // ---- Only update if something changed ----
      if (
        customer.loyaltyTitle !== newLoyaltyTitle ||
        currentBalance !== totalPoints
      ) {
        // Update customer record
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            loyaltyTitle: newLoyaltyTitle,
            updatedAt: new Date(),
          },
        });

        // Add a new ledger entry
        await prisma.pointsLedger.create({
          data: {
            customerId: customer.id,
            change: totalPoints - currentBalance,
            balanceAfter: totalPoints,
            reason: "Automatic Loyalty Update",
            sourceType: "CRON_JOB",
          },
        });

        console.log(
          `✅ ${customer.firstName} → ${newLoyaltyTitle} (${totalPoints} pts)`
        );
      } else {
        console.log(
          `ℹ️ No change for ${customer.firstName} (${customer.loyaltyTitle})`
        );
      }
    }

    console.log("🎯 Loyalty cron completed successfully.");
  } catch (error) {
    console.error("❌ Error in loyalty cron:", error);
  } finally {
    await prisma.$disconnect();
  }
};
