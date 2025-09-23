import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch"; // or native fetch in Node 18+

const prisma = new PrismaClient();

export async function applyOffersToTestCustomers() {
  // Fetch customers with at least 1 order
  const customers = await prisma.customer.findMany({
    where: { numberOfOrders: { gte: 1 } },
  });

  console.log(`Found ${customers.length} customers.`);

  if (customers.length === 0) return 0;

  const offers = await prisma.offer.findMany({ where: { isActive: true } });
  console.log(`Found ${offers.length} active offers.`);

  const ledgerEntries: any[] = [];

  for (const customer of customers) {
    console.log(`\nProcessing customer ${customer.id} (${customer.firstName} ${customer.lastName})`);

    // fetch last balance
    const lastEntry = await prisma.pointsLedger.findFirst({
      where: { customerId: customer.id },
      orderBy: { id: "desc" },
    });
    let prevBalance = lastEntry?.balanceAfter || 0;

    let totalPointsAdded = 0;

    for (const offer of offers) {
      // skip if already applied
      const alreadyApplied = await prisma.pointsLedger.findFirst({
        where: {
          customerId: customer.id,
          sourceId: offer.id,
          sourceType: "offer",
        },
      });

      if (alreadyApplied) {
        console.log(`  ⚠️ Offer ${offer.name} already applied. Skipping.`);
        continue;
      }

      let pointsToAdd = 0;
      switch (offer.offerType) {
        case "CASHBACK":
          pointsToAdd = Math.floor(Number(offer.value) / 10) || 1;
          break;
        case "POINTS":
          pointsToAdd = offer.pointsCost || 0; // reward points
          break;
        default:
          console.log(`  ⚠️ Offer type ${offer.offerType} not handled`);
          continue;
      }

      if (pointsToAdd > 0) {
        prevBalance += pointsToAdd;
        totalPointsAdded += pointsToAdd;

        ledgerEntries.push({
          customerId: customer.id,
          change: pointsToAdd,
          balanceAfter: prevBalance,
          reason: `Applied offer: ${offer.name}`,
          sourceType: "offer",
          sourceId: offer.id,
        });

        console.log(`  ✅ Assigned ${pointsToAdd} points for offer ${offer.name}`);
      }
    }

    // Send email notification if points were added
    if (totalPointsAdded > 0) {
      try {
        await fetch("http://localhost:3000/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: customer.email,
            subject: "You have earned points!",
            points: totalPointsAdded,
          }),
        });
        console.log(`  📧 Sent points notification to ${customer.email}`);
      } catch (err: any) {
        console.error(`  ❌ Failed to send email to ${customer.email}:`, err.message);
      }
    }
  }

  // Insert all ledger entries
  if (ledgerEntries.length > 0) {
    try {
      await prisma.pointsLedger.createMany({ data: ledgerEntries });
      console.log(`Inserted ${ledgerEntries.length} ledger entries.`);
    } catch (err: any) {
      console.error("❌ Failed to insert ledger entries:", err.message);
    }
  } else {
    console.log("No new ledger entries to insert.");
  }

  return ledgerEntries.length;
}
