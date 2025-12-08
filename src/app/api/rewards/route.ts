import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json(); // This might throw if body is empty or invalid
    const { tier } = body;

    if (!tier) {
      return NextResponse.json({ error: "Tier is required" }, { status: 400, headers: corsHeaders });
    }

    const shop = await prisma.shop.findFirst();
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 500, headers: corsHeaders });
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
    const validRewards = nodes
      .map((n: any) => {
        const d = n.discount;
        return {
          id: n.id,
          title: d.title,
          code: d.codes?.nodes?.[0]?.code,
          type: d.__typename,
          segments: d.customerSelection?.segments?.map((s: any) => s.name) || [],
          value: d.customerGets?.value
        };
      })
      .filter((r: any) => {
         return r.segments.some((segName: string) => 
            segName.toLowerCase().includes(tier.toLowerCase())
         );
      });

    return NextResponse.json({ success: true, rewards: validRewards }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500, headers: corsHeaders });
  } finally {
    await prisma.$disconnect();
  }
}
