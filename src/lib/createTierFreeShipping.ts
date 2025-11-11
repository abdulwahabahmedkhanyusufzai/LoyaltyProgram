// src/scripts/createTierFreeShipping.ts
import { PrismaClient } from "@prisma/client";
import { getShopDataFromDb, createTierSegments } from "./createTierDiscount";

const prisma = new PrismaClient();

// =======================
// Free Shipping Mutation Template
// =======================
const CREATE_FREE_SHIPPING_MUTATION = `
  mutation CreateFreeShipping($input: DiscountCodeFreeShippingInput!) {
    discountCodeFreeShippingCreate(freeShippingCodeDiscount: $input) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeFreeShipping {
            title
            codes(first: 1) { nodes { code } }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

// =======================
// Main Function
// =======================
export async function createTierFreeShippingDiscounts() {
  console.log("🚀 Starting Tier Free Shipping Discount Creation...");

  // -----------------------
  // STEP 0: Get Shop Data
  // -----------------------
  const shopData = await getShopDataFromDb();
  if (!shopData) return { error: "Shop not found or unauthorized" };
  const { shopDomain, accessToken } = shopData;

  // -----------------------
  // STEP 1: Ensure Segments Exist
  // -----------------------
  const tiers = ["Bronze", "Silver", "Gold", "Platinum"];
  const tierSegmentResults = await createTierSegments(shopDomain, accessToken, []);

  const tierSegments: Record<string, any> = {};
  for (const tier of tiers) {
    const res = tierSegmentResults[tier];
    if (res?.segment?.id) {
      tierSegments[tier] = res.segment;
      console.log(`✅ Using segment for ${tier}: ${res.segment.id}`);
    } else if (res?.segmentId) {
      tierSegments[tier] = { id: res.segmentId };
      console.log(`✅ Using existing segment for ${tier}: ${res.segmentId}`);
    } else {
      console.warn(`⚠️ ${tier} segment creation failed`);
    }
  }

  // -----------------------
  // STEP 2: Define Free Shipping Rules
  // -----------------------
  const tierRules: Record<string, any> = {
    Bronze: { appliesOncePerCustomer: false, destination: { all: true } }, // No free shipping -> skip
    Silver: { appliesOncePerCustomer: true, destination: { all: true } }, // On next order
    Gold: { appliesOncePerCustomer: true, destination: { all: true } },   // On next order
    Platinum: { appliesOncePerCustomer: false, destination: { all: true } }, // As long as status active
  };

  const results: Record<string, any> = {};

  // -----------------------
  // STEP 3: Create Discounts
  // -----------------------
  for (const [tier, segment] of Object.entries(tierSegments)) {
    if (!segment?.id) {
      console.warn(`⚠️ Skipping ${tier} — segment not found`);
      results[tier] = { success: false, error: "Segment not found" };
      continue;
    }

    // Skip Bronze if no free shipping
    if (tier === "Bronze") {
      results[tier] = { success: true, skipped: true, reason: "No free shipping" };
      continue;
    }

    const input = {
      title: `${tier} Tier Free Shipping`,
      code: `${tier.toUpperCase()}FREESHIP`,
      startsAt: new Date().toISOString(),
      appliesOncePerCustomer: tierRules[tier].appliesOncePerCustomer,
      destination: tierRules[tier].destination,
      context: { customerSegments: { add: [segment.id] } },
    };

    console.log(`🧾 Creating Free Shipping Discount for ${tier}: ${input.code}`);

    try {
      const res = await fetch(`https://${shopDomain}/admin/api/2025-10/graphql.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
        body: JSON.stringify({ query: CREATE_FREE_SHIPPING_MUTATION, variables: { input } }),
      });

      const data = await res.json();
      const mutationData = data?.data?.discountCodeFreeShippingCreate;

      if (mutationData?.userErrors?.length) {
        console.error(`❌ ${tier} creation errors:`, mutationData.userErrors);
        results[tier] = { success: false, errors: mutationData.userErrors };
      } else {
        console.log(`✅ ${tier} Free Shipping discount created successfully`);
        results[tier] = { success: true, discount: mutationData.codeDiscountNode };
      }
    } catch (err) {
      console.error(`💥 Exception during ${tier} free shipping creation:`, err);
      results[tier] = { success: false, error: String(err) };
    }
  }

  console.log("\n🎯 Final Tier Free Shipping Discount Results:");
  console.table(
    Object.entries(results).map(([tier, res]) => ({
      Tier: tier,
      Success: res.success,
      Skipped: res.skipped || false,
      Error: res.error || "-",
    }))
  );

  return results;
}
