import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Query matches both Basic (Fixed/Percent) and FreeShipping discount types
const GET_DISCOUNTS_QUERY = `
  query GetAppDiscounts {
    discountNodes(first: 50, query: "status:active") {
      nodes {
        id
        discount {
          __typename
          ... on DiscountCodeBasic {
            title
            codes(first: 1) { nodes { code } }
            customerSelection {
              ... on DiscountCustomerSegments {
                segments { id name }
              }
            }
            customerGets {
              value {
                ... on DiscountAmount { amount { amount currencyCode } }
                ... on DiscountPercentage { percentage }
              }
            }
          }
          ... on DiscountCodeFreeShipping {
             title
             codes(first: 1) { nodes { code } }
             customerSelection {
              ... on DiscountCustomerSegments {
                segments { id name }
              }
            }
          }
        }
      }
    }
  }
`;

function jsonResponse(data: any, status = 200) {
  const res = NextResponse.json(data, { status });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return jsonResponse(null, 204);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tier } = body;

    if (!tier) {
      return jsonResponse({ error: "Tier is required" }, 400);
    }

    const shop = await prisma.shop.findFirst();
    if (!shop) {
      return jsonResponse({ error: "Shop not found" }, 500);
    }

    const response = await fetch(`https://${shop.shop}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shop.accessToken,
      },
      body: JSON.stringify({ query: GET_DISCOUNTS_QUERY }),
    });

    const data = await response.json();
    const nodes = data.data?.discountNodes?.nodes || [];

    // Filter discounts that target the user's tier segment
    // We look for segments that contain the Tier name (e.g. "Silver")
    const validRewards = nodes
      .map((n: any) => {
        const d = n.discount;
        return {
          id: n.id,
          title: d.title,
          code: d.codes?.nodes?.[0]?.code,
          type: d.__typename, // DiscountCodeBasic vs DiscountCodeFreeShipping
          segments: d.customerSelection?.segments?.map((s: any) => s.name) || [],
          value: d.customerGets?.value
        };
      })
      .filter((r: any) => {
         // Check if any associated segment matches the requested tier
         // e.g. "Loyalty Level Silver" contains "Silver"
         return r.segments.some((segName: string) => 
            segName.toLowerCase().includes(tier.toLowerCase())
         );
      });

    return jsonResponse({ success: true, rewards: validRewards });

  } catch (error: any) {
    console.error("Error fetching rewards:", error);
    return jsonResponse({ error: error.message }, 500);
  } finally {
    await prisma.$disconnect();
  }
}
