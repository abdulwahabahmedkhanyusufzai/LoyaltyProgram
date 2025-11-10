// src/scripts/cronApplyOffers.ts
import { runLoyaltyCronJob } from "../app/utils/applyOffertoCustomer";
import { createTierDiscounts } from "../app/utils/createTierDiscounts"; // adjust the path if different
import cron from "node-cron";

async function runOffers() {
  try {
    console.log("🚀 Running loyalty cron + creating tier discounts...");

    // 1️⃣ Apply offers to customers first
    const appliedCount = await runLoyaltyCronJob();
    console.log(`✅ Offers applied to ${appliedCount} customers at ${new Date()}`);

    // 2️⃣ Then create or update tier discounts
    const discountResults = await createTierDiscounts();
    console.log("🏷️ Tier Discounts Created:", discountResults);

  } catch (err) {
    console.error("❌ Error in cron job:", err);
  }
}

// Run immediately
runOffers();

// Schedule to run every day at midnight
cron.schedule("0 0 * * *", runOffers);
