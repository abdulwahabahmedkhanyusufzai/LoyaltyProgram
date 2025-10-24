// src/scripts/cronApplyOffers.ts
import { runOfferCronJob } from "../app/utils/applyOffertoCustomer";
import cron from "node-cron";

async function runOffers() {
  try {
    const appliedCount = await runOfferCronJob();
    console.log(`✅ Offers applied to ${appliedCount} customers at ${new Date()}`);
  } catch (err) {
    console.error("❌ Error applying offers:", err);
  
}
}
// Run immediately
runOffers();

// Schedule future runs (every day at midnight)
cron.schedule("0 0 * * *", runOffers);
