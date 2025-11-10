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
    const shop = await prisma.shop.findFirst();
    if (!shop?.accessToken || !shop?.shop) return null;
    return { accessToken: shop.accessToken, shopDomain: shop.shop };
  } catch (err) {
    console.error("❌ Prisma error fetching shop:", err);
    return null;
  }
}

/**
 * 🔹 Creates Shopify discount codes for customer segments
 * Bronze (€14), Silver (€35), Gold (€49), Platinum (€80)
 */
export async function createTierDiscounts() {
  const shopData = await getShopDataFromDb();
  if (!shopData) {
    console.error("❌ Shop not found or unauthorized");
    return { error: "Shop not found or unauthorized" };
  }

  const { shopDomain, accessToken } = shopData;

  // 1️⃣ Fetch segments
  const segmentRes = await fetch(`https://${shopDomain}/admin/api/2025-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query: GET_SEGMENTS_QUERY }),
  });

  const segmentData = await segmentRes.json();
  const segments = segmentData?.data?.segments?.edges?.map((e: any) => e.node) || [];

  // 2️⃣ Find IDs for each tier segment
  const tierSegments = {
    Bronze: segments.find((s: any) => s.name.toLowerCase().includes("bronze")),
    Silver: segments.find((s: any) => s.name.toLowerCase().includes("silver")),
    Gold: segments.find((s: any) => s.name.toLowerCase().includes("gold")),
    Platinum: segments.find((s: any) => s.name.toLowerCase().includes("platinum")),
  };

  // 3️⃣ Discount amounts
  const tierDiscounts = {
    Bronze: "14",
    Silver: "35",
    Gold: "49",
    Platinum: "80",
  };

  const results: Record<string, any> = {};

  // 4️⃣ Create discounts
  for (const [tier, segment] of Object.entries(tierSegments)) {
    if (!segment?.id) {
      results[tier] = { success: false, error: "Segment not found" };
      continue;
    }

    const amount = tierDiscounts[tier as keyof typeof tierDiscounts];
    const title = `${tier} Tier Discount`;
    const code = `${tier.toUpperCase()}${amount}`;

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
      const mutationData = data?.data?.discountCodeBasicCreate;

      if (mutationData?.userErrors?.length > 0) {
        console.error(`${tier} discount errors:`, mutationData.userErrors);
        results[tier] = { success: false, errors: mutationData.userErrors };
      } else {
        results[tier] = { success: true, discount: mutationData.codeDiscountNode };
      }
    } catch (err) {
      console.error(`❌ Failed to create ${tier} discount:`, err);
      results[tier] = { success: false, error: "Internal Server Error" };
    }
  }

  console.log("✅ Tier discount creation results:", results);
  return results;
}
