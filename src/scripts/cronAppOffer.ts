// src/scripts/cronApplyOffers.ts
import { createTierPercentageDiscounts } from "@/lib/createTierPercentDiscount";
import { runLoyaltyCronJob } from "../app/utils/applyOffertoCustomer";
import { createTierDiscounts } from "../lib/createTierDiscount"; // adjust the path if different
import cron from "node-cron";
import { createTierFreeShippingDiscounts } from "@/lib/createTierFreeShipping";

async function runOffers() {
  try {
    console.log("🚀 Running loyalty cron + creating tier discounts...");

    // 1️⃣ Apply offers to customers first
    const appliedCount = await runLoyaltyCronJob();
    console.log(`✅ Offers applied to ${appliedCount} customers at ${new Date()}`);

    // 2️⃣ Then create or update tier discounts
    const discountResults = await createTierDiscounts();
    console.log("🏷️ Tier Discounts Created:", discountResults);

    const discountPercent = await createTierPercentageDiscounts();
    console.log("Tier Percen Discount Created",discountPercent);
    
    const tierFree = await createTierFreeShippingDiscounts();
    console.log("Tier Free Shipping Created",tierFree);
  } catch (err) {
    console.error("❌ Error in cron job:", err);
  }
}

// Run immediately
runOffers();

// Schedule to run every day at midnight
cron.schedule("0 0 * * *", runOffers);