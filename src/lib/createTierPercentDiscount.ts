// src/scripts/createTierDiscountsPercentage.ts
import {
  CREATE_SEGMENT_DISCOUNT_MUTATION,
  createTierSegments,
  fetchAllDiscounts,
  GET_SEGMENTS_QUERY,
  getShopDataFromDb,
} from "./createTierDiscount";



// =======================
// Main Function
// =======================
export async function createTierPercentageDiscounts() {
  console.log("🚀 Starting Tier Percentage Discount Creation...");

  // -----------------------
  // STEP 0: Get Shop Data
  // -----------------------
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
  const existingSegments = segmentData?.data?.segments?.edges?.map((e: any) => e.node) || [];

  // -----------------------
  // STEP 2: Ensure Segments Exist
  // -----------------------
  const tierSegmentResults = await createTierSegments(shopDomain, accessToken, existingSegments);

  const tierSegments: Record<string, any> = {};
  for (const [tier, res] of Object.entries(tierSegmentResults)) {
    if (res.segmentId) {
      // Existing segment that was skipped
      tierSegments[tier] = { id: res.segmentId };
      console.log(`✅ Using existing segment for ${tier}: ${res.segmentId}`);
    } 
  }

  // -----------------------
  // STEP 3: Define Tier Percentages
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

  // -----------------------
  // STEP 6: Log Summary
  // -----------------------
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
