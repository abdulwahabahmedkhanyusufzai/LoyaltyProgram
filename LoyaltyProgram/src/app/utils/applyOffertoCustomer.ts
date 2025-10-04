import { prisma } from "../../lib/prisma";
type LedgerEntry = {
  customerId: string;
  change: number;
  balanceAfter: number;
  reason: string;
  sourceType: string;
  sourceId: string;
};

export async function runOfferCronJob() {
  try {
    console.log("🟢 Cron Job started:", new Date());

    const offers = await prisma.offer.findMany({ where: { isActive: true } });
    console.log(`Fetched ${offers.length} active offers.`);

    if (!offers.length) return;

    const customers = await prisma.customer.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, loyaltyTitle: true, amountSpent: true },
    });
    console.log(`Fetched ${customers.length} customers.`);

    if (!customers.length) return;

    const allLedgerEntries = await prisma.pointsLedger.findMany({
      where: { customerId: { in: customers.map(c => c.id) }, sourceType: "offer" },
    });

    const ledgerMap = new Map<string, LedgerEntry[]>();
    allLedgerEntries.forEach(e => {
      if (!ledgerMap.has(e.customerId)) ledgerMap.set(e.customerId, []);
      ledgerMap.get(e.customerId)?.push({
        customerId: e.customerId,
        change: e.change,
        balanceAfter: e.balanceAfter,
        reason: e.reason,
        sourceType: e.sourceType,
        sourceId: e.sourceId,
      });
    });

    const ledgerEntries: LedgerEntry[] = [];
    const today = new Date();

    for (const offer of offers) {
      console.log(`\n🔹 Processing offer: "${offer.name}"`);

      const eligibleCustomers = customers.filter(c => {
        if (!offer.isActive) return false;
        if (offer.tierRequired && c.loyaltyTitle !== offer.tierRequired) return true;
        const start = new Date(offer.startDate);
        const end = new Date(offer.endDate);
        if (today < start || today > end) return false;
        return true;
      });

      console.log(`Eligible customers for "${offer.name}": ${eligibleCustomers.length}`);

      for (const customer of eligibleCustomers) {
        const alreadyApplied = ledgerMap
          .get(customer.id)
          ?.some(e => e.sourceId === offer.id);

        if (alreadyApplied) continue;

        let pointsToAdd = 0;

        if (offer.offerType === "CASHBACK") {
          if (Number(customer.amountSpent) <= 0) {
            console.log(`❌ ${customer.email} has spent 0, skipping.`);
            continue;
          }

const match = offer.description.match(/(\d+)\s*(?:Euro|EUR|€)\s*=\s*(\d+)\s*(?:Point|pt)/i);
          if (!match) {
            console.log(`❌ Offer "${offer.name}" description format invalid.`);
            continue;
          }

          const euroPerPoint = parseFloat(match[1]);
          const pointsPerUnit = parseFloat(match[2]);

          pointsToAdd = Math.floor(Number(customer.amountSpent) / euroPerPoint) * pointsPerUnit;

          if (pointsToAdd <= 0) {
            console.log(`❌ ${customer.email} not eligible, spent ${customer.amountSpent} < ${euroPerPoint}`);
            continue;
          }
        } else if (offer.offerType === "POINTS") {
          pointsToAdd = offer.pointsCost || 0;
        }

        const lastEntry = ledgerMap.get(customer.id)?.slice(-1)[0];
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

        console.log(`✅ ${customer.firstName} ${customer.lastName} gets ${pointsToAdd} points (balance: ${newBalance})`);
      }
    }

    if (ledgerEntries.length > 0) {
      await prisma.pointsLedger.createMany({ data: ledgerEntries });
      console.log(`Inserted ${ledgerEntries.length} ledger entries successfully.`);
    } else {
      console.log("No new ledger entries to insert.");
    }

    console.log("🟢 Cron Job finished.");
  } catch (err) {
    console.error("❌ Cron Job failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}
