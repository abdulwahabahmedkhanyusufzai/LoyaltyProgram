import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();

export async function runOfferCronJob() {
  // Step 1: Fetch all active offers
  const offers = await prisma.offer.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (offers.length === 0) return;

  // Step 2: Fetch all customers with their totalOrderAmount
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      loyaltyTitle: true,
      numberOfOrders: true,
      amountSpent: true, // make sure this exists
    },
  });

  if (customers.length === 0) return;

  const ledgerEntries: any[] = [];
  const today = new Date();

  // Step 3: Loop through offers and assign points
  for (const offer of offers) {
    // Filter eligible customers
    const eligibleCustomers = customers.filter((customer) => {
      const start = new Date(offer.startDate);
      const end = new Date(offer.endDate);

      if (!offer.isActive) return false;
      if (today < start || today > end) return false;
      if (offer.tierRequired && customer.loyaltyTitle !== offer.tierRequired) return true;

      return true;
    });

    for (const customer of eligibleCustomers) {
      // Skip if offer already applied
      const alreadyApplied = await prisma.pointsLedger.findFirst({
        where: {
          customerId: customer.id,
          sourceType: "offer",
          sourceId: offer.id,
        },
      });
      if (alreadyApplied) continue;

      // Calculate points
      let pointsToAdd = 0;

      if (offer.offerType === "CASHBACK") {
        // Parse description like "10 Euro = 1 Point"
        const match = offer.description.match(/(\d+)\s*Euro\s*=\s*(\d+)\s*Point/i);
        pointsToAdd = 1; // default
        if (match) {
          const euroPerPoint = parseFloat(match[1]);
          const pointsPerUnit = parseFloat(match[2]);
          pointsToAdd = Math.floor(Number(customer.amountSpent) / euroPerPoint) * pointsPerUnit;
        }
      } else if (offer.offerType === "POINTS") {
        pointsToAdd = offer.pointsCost || 0;
      }

      if (pointsToAdd > 0) {
        // Prepare ledger entry
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
          `✅ Customer ${customer.firstName} ${customer.lastName} gets ${pointsToAdd} points for offer "${offer.name}"`
        );

        // Optional: send email
      
      }
    }
  }

  // Step 4: Insert all ledger entries
  if (ledgerEntries.length > 0) {
    await prisma.pointsLedger.createMany({ data: ledgerEntries });
    console.log(`Inserted ${ledgerEntries.length} ledger entries.`);
  } else {
    console.log("No new ledger entries to insert.");
  }
}
