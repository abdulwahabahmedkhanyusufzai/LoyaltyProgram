// src/scripts/createTierDiscountsPercentage.ts
import { PrismaClient } from "@prisma/client";
import { CREATE_SEGMENT_DISCOUNT_MUTATION,createTierSegments,fetchAllDiscounts, GET_SEGMENTS_QUERY, getShopDataFromDb} from "./createTierDiscount";
const prisma = new PrismaClient();

// =======================
// Helper: Create Segment
// =======================


// =======================
// Main Function
// =======================
export async function createTierPercentageDiscounts() {
  console.log("🚀 Starting Tier Percentage Discount Creation...");

  const shopData = await getShopDataFromDb();
  if (!shopData) return { error: "Shop not found or unauthorized" };
  const { shopDomain, accessToken } = shopData;

  // -----------------------
  // STEP 1: Fetch Existing Segments
  // -----------------------
  const segmentRes = await fetch(`https://${shopDomain}/admin/api/2025-10/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
    body: JSON.stringify({ query: GET_SEGMENTS_QUERY }),
  });
  const segmentData = await segmentRes.json();
  const segments = segmentData?.data?.segments?.edges?.map((e: any) => e.node) || [];

  const tierTags: Record<string, string> = {
    Bronze: "Bronze",
    Silver: "Silver",
    Gold: "Gold",
    Platinum: "Platinum",
  };

  const tierSegments: Record<string, any> = {};

  // -----------------------
  // STEP 2: Ensure Segments Exist
  // -----------------------
  for (const [tier, tag] of Object.entries(tierTags)) {
    const existingSegment = segments.find((s: any) => s.name.toLowerCase().includes(tier.toLowerCase()));
    if (existingSegment) {
      console.log(`⚠️ Segment for ${tier} already exists — skipping creation.`);
      tierSegments[tier] = existingSegment;
    } else {
      console.log(`⚡ Creating missing segment for ${tier}...`);
      const segment = await createTierSegments(shopDomain, accessToken, existingSegment);
      if (segment) {
        tierSegments[tier] = segment;
        console.log(`✅ Segment created for ${tier} with ID ${segment.id}`);
      }
    }
  }

  // -----------------------
  // STEP 3: Tier Percentage Discounts
  // -----------------------
  const tierPercentages: Record<string, number> = {
    Bronze: 0.10,
    Silver: 0.10,
    Gold: 0.10,
    Platinum: 0.15,
  };

  // -----------------------
  // STEP 4: Fetch Existing Discounts
  // -----------------------
  const existingDiscounts = await fetchAllDiscounts(shopDomain, accessToken);
  const existingTitles = existingDiscounts.map(d => d.discount?.title).filter(Boolean);
  const existingCodes = existingDiscounts
    .flatMap(d => d.discount?.codes?.nodes?.map((c: any) => c.code.toUpperCase()) || [])
    .filter(Boolean);

  const results: Record<string, any> = {};

  // -----------------------
  // STEP 5: Create Discounts
  // -----------------------
  for (const [tier, segment] of Object.entries(tierSegments)) {
    console.log(`\n🔹 Processing Tier: ${tier}`);
    if (!segment?.id) {
      console.warn(`⚠️ Skipping ${tier} — segment not found.`);
      results[tier] = { success: false, error: "Segment not found" };
      continue;
    }

    const title = `${tier} Tier ${tierPercentages[tier] * 100}% Off`;
    const code = `${tier.toUpperCase()}${tierPercentages[tier] * 100}`;

    if (existingTitles.includes(title) || existingCodes.includes(code)) {
      console.warn(`⚠️ Skipping ${tier} — discount already exists (${title})`);
      results[tier] = { success: true, skipped: true, reason: "Already exists" };
      continue;
    }

    console.log(`🧾 Creating Discount: ${title} | Code: ${code} | Percent: ${tierPercentages[tier] * 100}%`);

    try {
      const res = await fetch(`https://${shopDomain}/admin/api/2025-10/graphql.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
        body: JSON.stringify({
          query: CREATE_SEGMENT_DISCOUNT_MUTATION,
          variables: {
            basicCodeDiscount: {
              title,
              code,
              startsAt: new Date().toISOString(),
              context: { customerSegments: { add: [segment.id] } },
              customerGets: { value: { percentage: tierPercentages[tier] }, items: { all: true } },
              appliesOncePerCustomer: true,
            },
          },
        }),
      });
      const data = await res.json();
      const mutationData = data?.data?.discountCodeBasicCreate;

      if (mutationData?.userErrors?.length) {
        console.error(`❌ ${tier} creation errors:`, mutationData.userErrors);
        results[tier] = { success: false, errors: mutationData.userErrors };
      } else {
        console.log(`✅ ${tier} discount created successfully.`);
        results[tier] = { success: true, discount: mutationData?.codeDiscountNode };
      }
    } catch (err) {
      console.error(`💥 Exception during ${tier} discount creation:`, err);
      results[tier] = { success: false, error: String(err) };
    }
  }

  console.log("\n🎯 Final Tier Percentage Discount Results:");
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
