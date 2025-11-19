import { PrismaClient, Order } from "@prisma/client";
const prisma = new PrismaClient();

// ----------------------------------------------------
// Shopify Order ID Retrieval (CRITICAL AGENT FUNCTION)
// FACT: We cannot update a metafield without the global Shopify Order ID.
// This function uses the local Order Number to find the Shopify ID.
// ----------------------------------------------------
async function fetchShopifyOrderIdByOrderNumber(
  shopifyUrl: string,
  accessToken: string,
  orderNumber: string
): Promise<string | null> {
  const query = `
    query GetOrderByNumber($query: String!) {
      orders(first: 1, query: $query) {
        edges {
          node {
            id // The REQUIRED global ID (e.g., gid://shopify/Order/12345)
          }
        }
      }
    }
  `;

  // Shopify uses the 'name' field for the customer-facing order number (e.g., #1001)
  const orderQuery = `name:${orderNumber}`; 

  try {
    const res = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables: { query: orderQuery } }),
    });

    const data = await res.json();
    const orderId = data.data?.orders?.edges[0]?.node?.id || null;

    if (!orderId) {
      console.warn(`🚨 WARNING: Shopify Order #${orderNumber} not found via query.`);
    } else {
      console.log(`✅ DISCOVERY: Shopify ID found for #${orderNumber}: ${orderId.substring(orderId.lastIndexOf('/') + 1)}`);
    }
    
    return orderId;
  } catch (e) {
    console.error(`❌ CRITICAL: Failed to query Shopify for Order ID for #${orderNumber}`, e);
    return null;
  }
}


// -----------------------------
// Update Shopify Order Metafield
// -----------------------------
async function updateOrderMetafield(
  shopifyUrl: string,
  accessToken: string,
  shopifyOrderId: string,
  points: number,
  orderNumber: string
) {
  // FACT: Metafields are a core mechanism for sharing data between apps.
  const mutation = `
    mutation OrderMetafieldAdd($input: OrderInput!) {
      orderUpdate(input: $input) {
        order {
          id
          metafields(first: 5, namespace: "loyalty") {
            edges {
              node {
                key
                value
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input = {
    id: shopifyOrderId,
    metafields: [
      {
        namespace: "loyalty",
        key: "points",
        type: "number_integer",
        value: points.toString(),
      },
    ],
  };

  const res = await fetch(shopifyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query: mutation, variables: { input } }),
  });

  const data = await res.json();

  if (data.data?.orderUpdate?.userErrors?.length) {
    console.error(
      `❌ Shopify metafield update error for Order #${orderNumber}`,
      data.data.orderUpdate.userErrors
    );
    return false;
  }

  console.log(`📦 SUCCESS: Metafield synchronized for Order #${orderNumber} → ${points} pts`);
  return true;
}

// -----------------------------
// Main Runner (The Agent Orchestrator)
// -----------------------------
async function run(): Promise<void> {
  console.log("🚀 Starting Loyalty Sync Agent. Task: Calculate and synchronize customer order points.");

  // 1️⃣ Validate necessary credentials
  const shopRecord = await prisma.shop.findFirst();
  if (!shopRecord) {
    console.error("❌ CRITICAL: No shop record found. Aborting mission.");
    return;
  }

  const { shop, accessToken } = shopRecord;
  const shopifyUrl = `https://${shop}/admin/api/2025-10/graphql.json`;

  // 2️⃣ Fetch customers eligible for loyalty benefits (gt: 1 order)
  const customers = await prisma.customer.findMany({
    where: { numberOfOrders: { gt: 1 } },
    include: {
      orders: true,
    },
  });

  console.log(`📌 Found ${customers.length} eligible customers for point recalculation.`);

  for (const customer of customers) {
    console.log(`\n==========================================================`);
    console.log(`👤 Processing Customer: ${customer.email} (${customer.orders.length} orders)`);
    console.log(`==========================================================`);

    // FACT: Tiers are based on historical spend (amountSpent).
    const amountSpent = Number(customer.amountSpent || 0);
    
    let tier = "Welcomed";
    let multiplier = 1;

    if (amountSpent >= 1000) {
      tier = "Platinum";
      multiplier = 2.5;
    } else if (amountSpent >= 750) {
      tier = "Gold";
      multiplier = 2;
    } else if (amountSpent >= 500) {
      tier = "Silver";
      multiplier = 1.5;
    } else if (amountSpent >= 200) {
      tier = "Bronze";
      multiplier = 1;
    }
    
    console.log(`📈 Calculated Loyalty Tier: ${tier} (Spent: €${amountSpent}) → ${multiplier}x Multiplier.`);

    // 3️⃣ Process each order to calculate and sync points
    for (const order of customer.orders) {
      const orderAmount = Number(order.totalAmount || 0);
      const orderPoints = Math.floor(orderAmount * multiplier);

      console.log(
        `   [Order #${order.orderNumber}]: Total €${orderAmount}. Points calculated: ${orderPoints} pts.`
      );

      // 3.1: Update local DB (essential for audit)
      if (order.pointsEarned !== orderPoints) {
        await prisma.order.update({
          where: { id: order.id },
          data: { pointsEarned: orderPoints },
        });
        console.log(`   [DB Sync]: Local record updated to ${orderPoints} pts.`);
      }

      // 3.2: Check for missing Shopify Order ID and attempt retrieval
      let shopifyIdToUse = order.shopifyOrderId;
      if (!shopifyIdToUse) {
        console.log(`   [Action Required]: Shopify ID is missing. Initiating GraphQL lookup...`);
        shopifyIdToUse = await fetchShopifyOrderIdByOrderNumber(
          shopifyUrl,
          accessToken,
          order.orderNumber
        );

        // If found, update the local DB record for future runs (DATA ENRICHMENT)
        if (shopifyIdToUse && shopifyIdToUse !== order.shopifyOrderId) {
          await prisma.order.update({
            where: { id: order.id },
            data: { shopifyOrderId: shopifyIdToUse },
          });
          console.log(`   [DATA ENRICHMENT]: Local record updated with Shopify ID.`);
        }
      }

      // 3.3: Attempt metafield update if ID is now available
      if (!shopifyIdToUse) {
        console.log(`   [STATUS]: Skipping metafield update. Cannot locate Shopify ID.`);
        continue;
      }

      await updateOrderMetafield(
        shopifyUrl,
        accessToken,
        shopifyIdToUse,
        orderPoints,
        order.orderNumber
      );
    }
  }

  console.log("\n🎯 Mission Complete: All eligible order points synchronized.");
}

// Safe exit
run()
  .catch((err) => {
    console.error("❌ Script crashed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });