// src/scripts/createTierDiscounts.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// =======================
// GraphQL Queries & Mutations
// =======================
export const GET_SEGMENTS_QUERY = `
  query {
    segments(first: 50) {
      edges { node { id name query } }
    }
  }
`;

export const LIST_DISCOUNTS_QUERY = `
  query ListDiscounts($after: String) {
    discountNodes(first: 50, after: $after) {
      nodes {
        id
        discount {
          ... on DiscountCodeBasic { title status codes(first: 10) { nodes { code } } }
          ... on DiscountAutomaticBasic { title status }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const CREATE_SEGMENT_MUTATION = `
  mutation CreateSegment($name: String!, $query: String!) {
    segmentCreate(name: $name, query: $query) {
      segment { id name query creationDate lastEditDate }
      userErrors { field message }
    }
  }
`;

export const CREATE_SEGMENT_DISCOUNT_MUTATION = `
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
              value { ... on DiscountAmount { amount { amount currencyCode } appliesOnEachItem } }
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
export async function getShopDataFromDb() {
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
// Fetch all discounts (paginated)
// =======================
export async function fetchAllDiscounts(shopDomain: string, accessToken: string) {
  let hasNextPage = true;
  let endCursor: string | null = null;
  const allDiscounts: any[] = [];

  while (hasNextPage) {
    try {
      const res = await fetch(`https://${shopDomain}/admin/api/2025-10/graphql.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
        body: JSON.stringify({ query: LIST_DISCOUNTS_QUERY, variables: { after: endCursor } }),
      });
      const data = await res.json();
      const nodes = data?.data?.discountNodes?.nodes || [];
      allDiscounts.push(...nodes);

      const pageInfo = data?.data?.discountNodes?.pageInfo;
      hasNextPage = pageInfo?.hasNextPage || false;
      endCursor = pageInfo?.endCursor || null;
    } catch (err) {
      console.error("❌ Error fetching discounts:", err);
      break;
    }
  }

  console.log(`📦 Total discounts fetched: ${allDiscounts.length}`);
  return allDiscounts;
}

// =======================
// Create missing tier segments
// =======================
export async function createTierSegments(shopDomain: string, accessToken: string, existingSegments: any[]) {
  const tierTags = ["Bronze", "Silver", "Gold", "Platinum"];
  const results: Record<string, any> = {};

  for (const tier of tierTags) {
    const exists = existingSegments.find((s: any) => s.name.toLowerCase().includes(tier.toLowerCase()));
    if (exists) {
      console.log(`⚠️ Segment for ${tier} already exists. Skipping. (ID: ${exists.id})`);
      results[tier] = { success: true, skipped: true, segmentId: exists.id };
      continue;
    }

    const query = `customer_tag = '${tier}'`;
    console.log(`🧩 Creating segment for ${tier}...`);

    try {
      const res = await fetch(`https://${shopDomain}/admin/api/2025-10/graphql.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
        body: JSON.stringify({ query: CREATE_SEGMENT_MUTATION, variables: { name: `Loyalty Level ${tier}`, query } }),
      });
      const data = await res.json();
      const mutationData = data?.data?.segmentCreate;

      if (mutationData?.userErrors?.length) {
        console.error(`❌ Segment creation errors for ${tier}:`, mutationData.userErrors);
        results[tier] = { success: false, errors: mutationData.userErrors };
      } else {
        console.log(`✅ Segment ${tier} created successfully (ID: ${mutationData.segment.id})`);
        results[tier] = { success: true, segment: mutationData.segment };
      }
    } catch (err) {
      console.error(`💥 Exception creating segment ${tier}:`, err);
      results[tier] = { success: false, error: String(err) };
    }
  }

  return results;
}

// =======================
// Main Function
// =======================
export async function createTierDiscounts() {
  console.log("🚀 Starting Tier Discount Creation...");
  const shopData = await getShopDataFromDb();
  if (!shopData) return { error: "Shop not found or unauthorized" };
  const { shopDomain, accessToken } = shopData;

  // 1️⃣ Fetch existing segments
  console.log("📡 Fetching existing segments...");
  const segmentRes = await fetch(`https://${shopDomain}/admin/api/2025-10/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
    body: JSON.stringify({ query: GET_SEGMENTS_QUERY }),
  });
  const segmentData = await segmentRes.json();
  let segments = segmentData?.data?.segments?.edges?.map((e: any) => e.node) || [];
  console.log(`✅ Segments retrieved: ${segments.length}`);
  console.table(segments.map((s: any) => ({ id: s.id, name: s.name })));

  // 2️⃣ Create missing segments
  const segmentResults = await createTierSegments(shopDomain, accessToken, segments);
  segments = segments.concat(
    Object.values(segmentResults).filter((r: any) => r.segment).map((r: any) => r.segment)
  );

  const tierSegments = {
    Bronze: segments.find((s: any) => s.name.toLowerCase().includes("bronze")),
    Silver: segments.find((s: any) => s.name.toLowerCase().includes("silver")),
    Gold: segments.find((s: any) => s.name.toLowerCase().includes("gold")),
    Platinum: segments.find((s: any) => s.name.toLowerCase().includes("platinum")),
  };

  // 3️⃣ Tier discount amounts
  const tierDiscounts = { Bronze: "14", Silver: "35", Gold: "49", Platinum: "80" };

  // 4️⃣ Fetch existing discounts
  console.log("🔍 Fetching existing discounts...");
  const existingDiscounts = await fetchAllDiscounts(shopDomain, accessToken);
  const existingTitles = existingDiscounts.map(d => d.discount?.title).filter(Boolean);
  const existingCodes = existingDiscounts
    .flatMap(d => d.discount?.codes?.nodes?.map((c: any) => c.code.toUpperCase()) || [])
    .filter(Boolean);

  console.log("📦 Existing discount titles:", existingTitles);
  console.log("📦 Existing discount codes:", existingCodes);

  // 5️⃣ Create missing discounts
  const results: Record<string, any> = {};
  for (const [tier, segment] of Object.entries(tierSegments)) {
    console.log(`\n🔹 Processing tier: ${tier}`);

    if (!segment?.id) {
      console.warn(`⚠️ Skipping ${tier} — segment not found`);
      results[tier] = { success: false, error: "Segment not found" };
      continue;
    }

    const amount = tierDiscounts[tier as keyof typeof tierDiscounts];
    const title = `${tier} Tier Discount`;
    const code = `${tier.toUpperCase()}${amount}`;

    if (existingTitles.includes(title) || existingCodes.includes(code)) {
      console.warn(`⚠️ Skipping ${tier} — discount already exists (${title})`);
      results[tier] = { success: true, skipped: true, reason: "Already exists" };
      continue;
    }

    console.log(`🧾 Creating discount: ${title} | Code: ${code} | Amount: €${amount}`);
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
              customerGets: { value: { discountAmount: { amount, appliesOnEachItem: false } }, items: { all: true } },
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
        console.log(`✅ ${tier} discount created successfully (ID: ${mutationData?.codeDiscountNode?.id})`);
        results[tier] = { success: true, discount: mutationData?.codeDiscountNode };
      }
    } catch (err) {
      console.error(`💥 Exception creating discount for ${tier}:`, err);
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
