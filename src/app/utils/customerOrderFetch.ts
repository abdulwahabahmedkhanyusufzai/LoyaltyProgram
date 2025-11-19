import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function fetchOrderFromShopify(shop, accessToken, orderNumber) {
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

  const variables = {
    query: `name:${orderNumber}`,
  };

  const res = await fetch(`https://${shop}/admin/api/2025-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  const order = json.data?.orders?.edges?.[0]?.node;
  return order || null;
}

async function run() {
  console.log("🔍 Starting Shopify Order ID backfill...");

  const shopRecord = await prisma.shop.findFirst();
  if (!shopRecord) {
    console.error("❌ No shop record found.");
    return;
  }

  const { shop, accessToken } = shopRecord;

  // 1️⃣ Get orders missing Shopify ID but having orderNumber
  const orders = await prisma.order.findMany({
    where: {
      shopifyOrderId: null,
      NOT:{orderNumber: null },
    },
  });

  console.log(`📌 Found ${orders.length} orders missing Shopify IDs`);

  for (const order of orders) {
    console.log(`\n➡️ Looking up ${order.orderNumber}`);

    const shopifyOrder = await fetchOrderFromShopify(
      shop,
      accessToken,
      order.orderNumber.replace("#", "")
    );

    if (!shopifyOrder) {
      console.log(`⚠️ No Shopify order found for ${order.orderNumber}`);
      continue;
    }

    console.log(`🟢 Found Shopify order: ${shopifyOrder.id}`);

    await prisma.order.update({
      where: { id: order.id },
      data: { shopifyOrderId: shopifyOrder.id },
    });

    console.log(`💾 Saved Shopify ID to DB`);
  }

  console.log("\n🎯 Backfill complete.");
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error("❌ Script crashed:", err);
  prisma.$disconnect();
});
