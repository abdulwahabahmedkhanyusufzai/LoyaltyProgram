import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ----------------------------------------------------
// Shopify GraphQL Fetcher
// ----------------------------------------------------
async function fetchOrderFromShopify(shop: string, accessToken: string, orderNumber: string) {
  const query = `
    query getOrder($query: String!) {
      orders(first: 1, query: $query) {
        edges {
          node {
            id 
            name
          }
        }
      }
    }
  `;
  
  // OPTIMIZATION: Use the robust query format to match the customer-facing name (e.g., name:"#1001")
 const customerFacingName = orderNumber.startsWith('#') ? `\"${orderNumber}\"` : `\"#${orderNumber}\"`;
const variables = {
  query: `name:"${customerFacingName}"`,
};

  try {
    const res = await fetch(`https://${shop}/admin/api/2025-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
        console.error("GraphQL Errors:", json.errors);
        return null;
    }

    const order = json.data?.orders?.edges?.[0]?.node;
    return order || null;
  } catch (e) {
      console.error("Network or Fetch Error during Shopify query:", e);
      return null;
  }
}

// ----------------------------------------------------
// Main Runner (Backfill Orchestrator)
// ----------------------------------------------------
async function run() {
  console.log("🔍 Starting Shopify Order ID backfill...");

  const shopRecord = await prisma.shop.findFirst();
  if (!shopRecord) {
    console.error("❌ CRITICAL: No shop record found. Aborting backfill.");
    return;
  }

  const { shop, accessToken } = shopRecord;

  // 1️⃣ Get orders missing Shopify ID and where orderNumber is non-empty.
  // FIX: Using the simpler, safer filter for non-null string fields.
  const orders = await prisma.order.findMany({
    where: {
      shopifyOrderId: null,
      orderNumber: { not: "" }, // Ensure orderNumber is not an empty string
    },
    // Optional: Add a simple sort for predictable processing
    orderBy: { orderNumber: 'asc' } 
  });

  console.log(`📌 Found ${orders.length} orders missing Shopify IDs with valid order numbers.`);

  for (const order of orders) {
    // Basic validation check to ensure orderNumber is a string we can use
    if (!order.orderNumber || typeof order.orderNumber !== 'string' || order.orderNumber.trim() === '') {
        console.warn(`⚠️ Skipping DB record ${order.id}: orderNumber field is invalid or missing.`);
        continue;
    }
    
    // Cleanup the orderNumber before use (e.g., ensuring it doesn't have a '#' yet)
    // NOTE: We don't replace '#' here, we let the fetcher function handle the correct formatting.
    const cleanOrderNumber = order.orderNumber.trim();

    console.log(`\n➡️ Looking up Order Name: ${cleanOrderNumber}`);

    const shopifyOrder = await fetchOrderFromShopify(
      shop,
      accessToken,
      cleanOrderNumber
    );

    if (!shopifyOrder) {
      console.log(`⚠️ No Shopify order found for ${cleanOrderNumber}. Moving to next.`);
      continue;
    }

    console.log(`🟢 DISCOVERY: Found Shopify order ID: ${shopifyOrder.id}`);

    try {
        await prisma.order.update({
            where: { id: order.id },
            data: { shopifyOrderId: shopifyOrder.id },
        });

        console.log(`💾 SUCCESS: Saved Shopify ID to DB for ${cleanOrderNumber}.`);
    } catch (updateError) {
        console.error(`❌ DB Update Error for ${cleanOrderNumber}:`, updateError);
    }
  }

  console.log("\n🎯 Backfill complete.");
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error("❌ Script crashed:", err);
  // Ensure we disconnect on crash
  prisma.$disconnect();
});