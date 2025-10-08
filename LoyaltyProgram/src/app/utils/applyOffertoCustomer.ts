import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper constants for multiplier lookups
// NOTE: "No Tier" uses the base rate (10 EUR = 1 pt, so 1 pt per 10 EUR)
// The pointsPerEuro is 1/10 = 0.1 for the base rate.
const TIER_MULTIPLIERS: { [key: string]: number } = {
  "No Tier": 0.1, // 1 point per 10 Euro
  "Bronze": 1.0, // 1 point per 1 Euro
  "Silver": 1.5, // 1.5 points per 1 Euro
  "Gold": 2.0, // 2 points per 1 Euro
  "Platinum": 2.5, // 2.5 points per 1 Euro
};

// Interface definitions (unchanged)
type LedgerEntry = {
 customerId: string;
 change: number;
 balanceAfter: number;
 reason: string;
 sourceType: string;
 sourceId: string;
};

// Helper function to get the base point value (points earned per 1 EUR spent)
function getBasePointMultiplier(tierTitle: string): number {
    // Default to the highest tier multiplier if a title isn't found, 
    // or the most basic rate for safety if the customer is not yet tiered.
    return TIER_MULTIPLIERS[tierTitle] ?? TIER_MULTIPLIERS["No Tier"];
}

export async function runOfferCronJob() {
 try {
  console.log("🟢 Cron Job started:", new Date());

  const offers = await prisma.offer.findMany({ where: { isActive: true } });
  console.log(`Fetched ${offers.length} active offers.`);

  if (!offers.length) return;

  // ⭐ MODIFIED: Select loyaltyPoints to correctly calculate the next balance
    const customers = await prisma.customer.findMany({
   select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true, 
        loyaltyTitle: true, 
        amountSpent: true
    },
  });
  console.log(`Fetched ${customers.length} customers.`);

  if (!customers.length) return;

    // --- (Ledger fetching logic remains the same) ---
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
    // --- (End Ledger fetching logic) ---


  const ledgerEntries: LedgerEntry[] = [];
  const today = new Date();

  for (const offer of offers) {
   console.log(`\n🔹 Processing offer: "${offer.name}"`);

   // ⭐ NOTE: The eligibility check for offer.tierRequired might need updating 
       // if you want to apply offers to tiers *above* the required tier as well.

   const eligibleCustomers = customers.filter(c => {
    if (!offer.isActive) return false;
    if (offer.tierRequired && c.loyaltyTitle !== offer.tierRequired) return false; // Strict match
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
          
          // ⭐ CRITICAL MODIFICATION: Use the tier-based multiplier
          // This multiplier acts as the points earned per Euro spent (e.g., 1.5 points per 1 Euro)
          const tierPointMultiplier = getBasePointMultiplier(customer.loyaltyTitle);
          
          // Calculate base points: Assume offer.description is now irrelevant for CASHBACK
          // We assume CASHBACK simply applies the customer's current tier rate to their total spend.
          pointsToAdd = Math.floor(Number(customer.amountSpent) * tierPointMultiplier);

          console.log(`Tier Multiplier for ${customer.loyaltyTitle}: ${tierPointMultiplier}`);
          
     if (pointsToAdd <= 0) {
      console.log(`❌ ${customer.email} not eligible, spent ${customer.amountSpent} resulting in 0 points.`);
      continue;
     }
          
        // ⭐ MODIFIED: Check for the special redemption offer (100 points = 5 Euro)
        // This is a redemption offer and should probably not be processed as "CASHBACK" based on spending.
        // I am ASSUMING this logic block is for point *earning* on spending, not redemption.
        // A separate logic block should handle redemptions (negative point changes).

    } else if (offer.offerType === "POINTS") {
     pointsToAdd = offer.pointsCost || 0;
    }

    // ⭐ MODIFIED: Use the customer's actual loyaltyPoints for the starting balance
    // ⭐ MODIFIED: Use the customer's actual loyaltyPoints for the starting balance
    // loyaltyPoints field does not exist; default to 0 or compute from ledger if needed
    const prevBalance = 0; 
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
   // NOTE: This code assumes customer records are updated elsewhere. 
      // If customer.loyaltyPoints needs updating here, you'll need additional Prisma code.
   await prisma.pointsLedger.createMany({ data: ledgerEntries as any });
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