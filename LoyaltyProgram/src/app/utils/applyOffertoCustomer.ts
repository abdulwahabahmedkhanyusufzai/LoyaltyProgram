import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function runOfferCronJob() {
  try {
    console.log("🟢 Cron Job started:", new Date());

    // Step 1: Fetch all active offers
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    console.log(`Fetched ${offers.length} active offers.`);

    if (offers.length === 0) return console.log("No active offers, exiting.");

    // Step 2: Fetch all customers with their totalOrderAmount
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        loyaltyTitle: true,
        numberOfOrders: true,
        amountSpent: true,
      },
    });
    console.log(`Fetched ${customers.length} customers.`);

    if (customers.length === 0) return console.log("No customers found, exiting.");

    const ledgerEntries: any[] = [];
    const today = new Date();

    // Step 3: Loop through offers and assign points
    for (const offer of offers) {
      console.log(`\n🔹 Processing offer: "${offer.name}" (ID: ${offer.id})`);

      const start = new Date(offer.startDate);
      const end = new Date(offer.endDate);

      const eligibleCustomers = customers.filter((customer) => {
        if (!offer.isActive) {
          console.log(`Offer "${offer.name}" is inactive, skipping.`);
          return false;
        }
        if (today < start || today > end) {
          console.log(`Offer "${offer.name}" not valid today (${today.toISOString()}).`);
          return false;
        }
        return true;
      });

      console.log(`Eligible customers for "${offer.name}": ${eligibleCustomers.length}`);

      for (const customer of eligibleCustomers) {
        // Check if already applied
        const alreadyApplied = await prisma.pointsLedger.findFirst({
          where: {
            customerId: customer.id,
            sourceType: "offer",
            sourceId: offer.id,
          },
        });

        if (alreadyApplied) {
          console.log(`Offer already applied for customer ${customer.email}, skipping.`);
          continue;
        }

        // Calculate points
        let pointsToAdd = 0;

        if (offer.offerType === "CASHBACK") {
          const match = offer.description.match(/(\d+)\s*Euro\s*=\s*(\d+)\s*Point/i);
          pointsToAdd = 1;
          if (match) {
            const euroPerPoint = parseFloat(match[1]);
            const pointsPerUnit = parseFloat(match[2]);
            pointsToAdd = Math.floor(Number(customer.amountSpent) / euroPerPoint) * pointsPerUnit;
          }
        } else if (offer.offerType === "POINTS") {
          pointsToAdd = offer.pointsCost || 0;
        }

        if (pointsToAdd > 0) {
          const lastEntry = await prisma.pointsLedger.findFirst({
            where: { customerId: customer.id },
            orderBy: { id: "desc" },
          });
          const prevBalance = lastEntry?.balanceAfter || 0;
          const newBalance = prevBalance + pointsToAdd;

          ledgerEntries.push({
            customerId: customer.id,
            change: pointsToAdd,
            balanceAfter: newBalance,
            reason: `Applied offer: ${offer.name}`,
            sourceType: "offer",
            sourceId: offer.id,
          });

          console.log(
            `✅ Customer ${customer.firstName} ${customer.lastName} gets ${pointsToAdd} points (balance: ${newBalance})`
          );
        } else {
          console.log(`No points to add for customer ${customer.email}.`);
        }
      }
    }

    // Step 4: Insert all ledger entries
    if (ledgerEntries.length > 0) {
      const result = await prisma.pointsLedger.createMany({ data: ledgerEntries });
      console.log(`Inserted ${ledgerEntries.length} ledger entries successfully.`);
    } else {
      console.log("No new ledger entries to insert.");
    }

    console.log("🟢 Cron Job finished.");
  } catch (error) {
    console.error("❌ Cron Job failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}
