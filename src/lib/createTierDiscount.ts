// src/scripts/createTierDiscounts.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const GET_SEGMENTS_QUERY = `
  query {
    segments(first: 20) {
      edges {
        node {
          id
          name
          query
        }
      }
    }
  }
`;

const CREATE_SEGMENT_DISCOUNT_MUTATION = `
  mutation CreateSegmentDiscountCode($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            title
            codes(first: 10) { nodes { code } }
            context { ... on DiscountCustomerSegments { segments { id } } }
            customerGets {
              value {
                ... on DiscountAmount {
                  amount { amount currencyCode }
                  appliesOnEachItem
                }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

async function getShopDataFromDb() {
  try {
    console.log("🟦 Fetching shop data from DB...");
    const shop = await prisma.shop.findFirst();
    if (!shop) {
      console.error("❌ No shop record found in DB!");
      return null;
    }
    console.log(`✅ Found shop: ${shop.shop}`);
    return { accessToken: shop.accessToken, shopDomain: shop.shop };
  } catch (err) {
    console.error("❌ Prisma error fetching shop:", err);
    return null;
  }
}

export async function createTierDiscounts() {
  console.log("🚀 Starting Tier Discount Creation...");
  const shopData = await getShopDataFromDb();

  if (!shopData) {
    console.error("❌ Shop not found or unauthorized");
    return { error: "Shop not found or unauthorized" };
  }

  const { shopDomain, accessToken } = shopData;

  // 🟦 STEP 1: Fetch Segments
  console.log("📡 Fetching segments from Shopify...");
  const segmentRes = await fetch(`https://${shopDomain}/admin/api/2025-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query: GET_SEGMENTS_QUERY }),
  });

  const segmentData = await segmentRes.json();
  if (!segmentData?.data?.segments?.edges) {
    console.error("❌ Failed to retrieve segments:", segmentData?.errors || segmentData);
    return { error: "Failed to fetch segments", raw: segmentData };
  }

  const segments = segmentData.data.segments.edges.map((e: any) => e.node);
  console.log(`✅ Retrieved ${segments.length} segments.`);
  console.table(segments.map((s: any) => ({ id: s.id, name: s.name })));

  // 🟦 STEP 2: Find Tier Segments
  const tierSegments = {
    Bronze: segments.find((s: any) => s.name.toLowerCase().includes("bronze")),
    Silver: segments.find((s: any) => s.name.toLowerCase().includes("silver")),
    Gold: segments.find((s: any) => s.name.toLowerCase().includes("gold")),
    Platinum: segments.find((s: any) => s.name.toLowerCase().includes("platinum")),
  };

  console.log("🧩 Matched Tier Segments:");
  console.table(
    Object.entries(tierSegments).map(([tier, seg]) => ({
      Tier: tier,
      Found: !!seg,
      SegmentID: seg?.id || "N/A",
      SegmentName: seg?.name || "Not Found",
    }))
  );

  // 🟦 STEP 3: Tier Discount Amounts
  const tierDiscounts = {
    Bronze: "14",
    Silver: "35",
    Gold: "49",
    Platinum: "80",
  };

  const results: Record<string, any> = {};

  // 🟦 STEP 4: Create Discounts
  for (const [tier, segment] of Object.entries(tierSegments)) {
    console.log(`\n🔹 Processing Tier: ${tier}`);

    if (!segment?.id) {
      console.warn(`⚠️ Skipping ${tier} — segment not found.`);
      results[tier] = { success: false, error: "Segment not found" };
      continue;
    }

    const amount = tierDiscounts[tier as keyof typeof tierDiscounts];
    const title = `${tier} Tier Discount`;
    const code = `${tier.toUpperCase()}${amount}`;

    console.log(`🧾 Creating Discount: ${title} | Code: ${code} | Amount: €${amount}`);
    console.log(`🔗 Target Segment ID: ${segment.id}`);

    try {
      const res = await fetch(`https://${shopDomain}/admin/api/2025-10/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: CREATE_SEGMENT_DISCOUNT_MUTATION,
          variables: {
            basicCodeDiscount: {
              title,
              code,
              startsAt: new Date().toISOString(),
              endsAt: null,
              context: { customerSegments: { add: [segment.id] } },
              customerGets: {
                value: { discountAmount: { amount, appliesOnEachItem: false } },
                items: { all: true },
              },
              appliesOncePerCustomer: true,
            },
          },
        }),
      });

      const data = await res.json();

      // Log full response for debugging
      console.log(`📨 Response for ${tier} Discount:`);
      console.dir(data, { depth: null });

      const mutationData = data?.data?.discountCodeBasicCreate;
      if (mutationData?.userErrors?.length > 0) {
        console.error(`❌ ${tier} discount creation errors:`, mutationData.userErrors);
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

  console.log("\n🎯 Final Tier Discount Results:");
  console.table(
    Object.entries(results).map(([tier, res]) => ({
      Tier: tier,
      Success: res.success,
      Error: res.error || "-",
    }))
  );

  console.log("✅ Tier discount creation process completed.");
  return results;
}

// To run directly (manual trigger)

