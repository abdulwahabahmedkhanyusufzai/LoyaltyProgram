// ... imports
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Move PrismaClient init to function scope or singleton pattern in a separate file preferably, 
// but for now moving inside POST to avoid top-level failures.

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
  console.log("OPTIONS request to /api/rewards");
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req: Request) {
  console.log("POST request to /api/rewards");
  const prisma = new PrismaClient();
  try {
    const body = await req.json(); // This might throw if body is empty or invalid
    let { tier, tiers } = body;

    // Normalize to array
    let activeTiers: string[] = [];
    if (Array.isArray(tiers)) {
      activeTiers = tiers;
    } else if (tier) {
      activeTiers = [tier];
    }

    if (activeTiers.length === 0) {
      return NextResponse.json({ error: "No tiers provided" }, { status: 400, headers: corsHeaders });
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

    console.log(`Fetched ${nodes.length} total discounts`);
    console.log(`Filtering for active tiers: ${activeTiers.join(", ")}`);
    
    // Filter discounts that target the user's tier segment (cumulative)
    const validRewards = nodes
      .map((n: any) => {
        const d = n.discount;
        return {
          id: n.id,
          title: d.title,
          code: d.codes?.nodes?.[0]?.code ? d.codes.nodes[0].code.trim() : null, // Trim backend code
          type: d.__typename,
          segments: d.customerSelection?.segments?.map((s: any) => s.name) || [],
          value: d.customerGets?.value
        };
      })
      .filter((r: any) => {
         // Check if ANY of the reward segments match ANY of the active tiers
         const match = r.segments.some((segName: string) => {
            const segLower = segName.toLowerCase();
            return activeTiers.some(t => segLower.includes(t.toLowerCase()));
         });

         if (!match) {
             console.log(`Excluded reward: ${r.title} (Segments: ${r.segments.join(', ')}) matches none of: ${activeTiers.join(', ')}`);
         } else {
             console.log(`Included reward: ${r.title} for tiers ${activeTiers.join(', ')}`);
         }
         return match;
      });

    return NextResponse.json({ success: true, rewards: validRewards }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500, headers: corsHeaders });
  } finally {
    await prisma.$disconnect();
  }
}
