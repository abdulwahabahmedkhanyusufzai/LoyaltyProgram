// src/scripts/createTierDiscounts.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// =======================
// GraphQL Queries
// =======================
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

const LIST_DISCOUNTS_QUERY = `
  query ListDiscounts($after: String) {
    discountNodes(first: 10, after: $after) {
      nodes {
        id
        discount {
          ... on DiscountCodeBasic {
            title
            status
            codes(first: 10) {
              nodes { code }
            }
          }
          ... on DiscountAutomaticBasic {
            title
            status
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
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

// =======================
// Fetch Shop Data from DB
// =======================
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

// =======================
// Fetch All Discounts (Paginated)
// =======================
async function fetchAllDiscounts(shopDomain: string, accessToken: string) {
  let hasNextPage = true;
  let endCursor: string | null = null;
  const allDiscounts: any[] = [];

  while (hasNextPage) {
    const res = await fetch(`https://${shopDomain}/admin/api/2025-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: LIST_DISCOUNTS_QUERY,
        variables: { after: endCursor },
      }),
    });

    const data = await res.json();
    const nodes = data?.data?.discountNodes?.nodes || [];
    allDiscounts.push(...nodes);

    const pageInfo = data?.data?.discountNodes?.pageInfo;
    hasNextPage = pageInfo?.hasNextPage || false;
    endCursor = pageInfo?.endCursor || null;
  }

  return allDiscounts;
}

// =======================
// Main Function
// =======================
export async function createTierDiscounts() {
  console.log("🚀 Starting Tier Discount Creation...");
  const shopData = await getShopDataFromDb();
  if (!shopData) return { error: "Shop not found or unauthorized" };

  const { shopDomain, accessToken } = shopData;

  // 🟦 STEP 1: Fetch Segments
  console.log("📡 Fetching segments from Shopify...");
  const segmentRes = await fetch(
    `https://${shopDomain}/admin/api/2025-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query: GET_SEGMENTS_QUERY }),
    }
  );

  const segmentData = await segmentRes.json();
  const segments = segmentData?.data?.segments?.edges?.map((e: any) => e.node);
  if (!segments) {
    console.error("❌ Failed to retrieve segments:", segmentData);
    return { error: "Failed to fetch segments" };
  }

  console.log(`✅ Retrieved ${segments.length} segments.`);
  console.table(segments.map((s: any) => ({ id: s.id, name: s.name })));

  // 🟦 STEP 2: Find Tier Segments
  const tierSegments = {
    Bronze: segments.find((s: any) => s.name.toLowerCase().includes("bronze")),
    Silver: segments.find((s: any) => s.name.toLowerCase().includes("silver")),
    Gold: segments.find((s: any) => s.name.toLowerCase().includes("gold")),
    Platinum: segments.find((s: any) =>
      s.name.toLowerCase().includes("platinum")
    ),
  };

  // 🟦 STEP 3: Tier Discount Amounts
  const tierDiscounts = {
    Bronze: "14",
    Silver: "35",
    Gold: "49",
    Platinum: "80",
  };

  // 🟦 STEP 4: Fetch Existing Discounts (All Types)
  console.log("🔍 Checking existing discounts...");
  const existingDiscounts = await fetchAllDiscounts(shopDomain, accessToken);

  const existingTitles = existingDiscounts
    .map(d => d.discount?.title)
    .filter(Boolean);

  const existingCodes = existingDiscounts
    .flatMap(d => d.discount?.codes?.nodes?.map((c: any) => c.code.toUpperCase()) || [])
    .filter(Boolean);

  console.log(`📦 Found ${existingDiscounts.length} total discounts.`);
  console.table(
    existingDiscounts.map(d => ({
      id: d.id,
      title: d.discount?.title,
      codes: d.discount?.codes?.nodes?.map((c: any) => c.code).join(", "),
    }))
  );

  // 🟦 STEP 5: Create Discounts (Skip if Already Exists)
  const results: Record<string, any> = {};

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

    // 🛑 Skip if duplicate
    if (existingTitles.includes(title) || existingCodes.includes(code)) {
      console.warn(`⚠️ Skipping ${tier} — discount already exists (${title})`);
      results[tier] = { success: true, skipped: true, reason: "Already exists" };
      continue;
    }

    console.log(`🧾 Creating Discount: ${title} | Code: ${code} | Amount: €${amount}`);

    try {
      const res = await fetch(
        `https://${shopDomain}/admin/api/2025-10/graphql.json`,
        {
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
                context: { customerSegments: { add: [segment.id] } },
                customerGets: {
                  value: {
                    discountAmount: { amount, appliesOnEachItem: false },
                  },
                  items: { all: true },
                },
                appliesOncePerCustomer: true,
              },
            },
          }),
        }
      );

      const data = await res.json();
      const mutationData = data?.data?.discountCodeBasicCreate;

      if (mutationData?.userErrors?.length) {
        console.error(`❌ ${tier} creation errors:`, mutationData.userErrors);
        results[tier] = { success: false, errors: mutationData.userErrors };
      } else {
        console.log(`✅ ${tier} discount created successfully.`);
        results[tier] = {
          success: true,
          discount: mutationData?.codeDiscountNode,
        };
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
      Skipped: res.skipped || false,
      Error: res.error || "-",
    }))
  );

  console.log("✅ Tier discount creation process completed.");
  return results;
}
