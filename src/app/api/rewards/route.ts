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

const GET_CUSTOMER_ORDERS_QUERY = `
  query GetCustomerOrders($id: ID!) {
    customer(id: $id) {
      orders(first: 50) {
        nodes {
          discountApplications(first: 5) {
            nodes {
              ... on DiscountCodeApplication {
                code
              }
            }
          }
        }
      }
    }
  }
`;

export async function POST(req: Request) {
  console.log("POST request to /api/rewards");
  const prisma = new PrismaClient();
  try {
    const body = await req.json();
    let { tier, tiers, customerId } = body;

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

    // 1. Fetch Discounts
    const discountsRes = await fetch(`https://${shop.shop}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shop.accessToken,
      },
      body: JSON.stringify({ query: GET_DISCOUNTS_QUERY }),
    });

    const discountsData = await discountsRes.json();
    const nodes = discountsData.data?.discountNodes?.nodes || [];

    // 2. Fetch Customer Used Codes (if customerId present)
    let usedCodes = new Set<string>();
    if (customerId) {
        const gid = customerId.toString().includes("gid://") ? customerId : `gid://shopify/Customer/${customerId}`;
        try {
            const customerRes = await fetch(`https://${shop.shop}/admin/api/2024-01/graphql.json`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": shop.accessToken,
                },
                body: JSON.stringify({ 
                    query: GET_CUSTOMER_ORDERS_QUERY,
                    variables: { id: gid }
                }),
            });
            const customerData = await customerRes.json();
            const orders = customerData.data?.customer?.orders?.nodes || [];
            
            orders.forEach((order: any) => {
                order.discountApplications?.nodes?.forEach((app: any) => {
                    if (app.code) usedCodes.add(app.code.toUpperCase());
                });
            });
            console.log(`Found ${usedCodes.size} used codes for customer ${customerId}`);
        } catch (err) {
            console.error("Error fetching customer orders:", err);
        }
    }

    console.log(`Fetched ${nodes.length} total discounts`);
    console.log(`Filtering for active tiers: ${activeTiers.join(", ")}`);
    
    // Filter discounts that target the user's tier segment (cumulative)
    const validRewards = nodes
      .map((n: any) => {
        const d = n.discount;
        const code = d.codes?.nodes?.[0]?.code ? d.codes.nodes[0].code.trim() : null;
        return {
          id: n.id,
          title: d.title,
          code: code,
          type: d.__typename,
          segments: d.customerSelection?.segments?.map((s: any) => s.name) || [],
          value: d.customerGets?.value,
          isClaimed: code ? usedCodes.has(code.toUpperCase()) : false
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
