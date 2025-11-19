// scripts/syncOrderPoints.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function updateOrderMetafield(shopifyUrl, accessToken, shopifyOrderId, points, orderNumber) {
  const mutation = `
    mutation OrderMetafieldAdd($input: OrderInput!) {
      orderUpdate(input: $input) {
        order {
          id
          metafields(first: 5) {
            edges {
              node {
                namespace
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
    console.error(`❌ Shopify metafield update error for Order #${orderNumber}`, data.data.orderUpdate.userErrors);
    return false;
  }

  console.log(`📦 Updated Shopify Metafield: Order #${orderNumber} → ${points} pts`);
  return true;
}

async function run() {
  console.log("🚀 Starting order-point sync for customers with >1 orders...");

  // 1️⃣ Get Shopify credentials
  const shopRecord = await prisma.shop.findFirst();
  if (!shopRecord) {
    console.error("❌ No shop record found.");
    return;
  }

  const { shop, accessToken } = shopRecord;
  const shopifyUrl = `https://${shop}/admin/api/2025-10/graphql.json`;

  // 2️⃣ Fetch only customers with more than 1 order
  const customers = await prisma.customer.findMany({
    where: { numberOfOrders: { gt: 1 } },
    include: {
      orders: true,
    },
  });

  console.log(`📌 Found ${customers.length} customers with more than 1 order`);

  for (const customer of customers) {
    console.log(`\n👤 Customer: ${customer.email} — Orders: ${customer.orders.length}`);

    // Determine multiplier (using your existing tier logic)
    const amountSpent = Number(customer.amountSpent || 0);

    let tier = "Welcomed";
    if (amountSpent >= 200 && amountSpent < 500) tier = "Bronze";
    else if (amountSpent >= 500 && amountSpent < 750) tier = "Silver";
    else if (amountSpent >= 750 && amountSpent < 1000) tier = "Gold";
    else if (amountSpent >= 1000) tier = "Platinum";

    const multiplier = { Bronze: 1, Silver: 1.5, Gold: 2, Platinum: 2.5 }[tier] || 1;

    // 3️⃣ Process each order for this customer
    for (const order of customer.orders) {
      const orderAmount = Number(order.totalAmount || 0);
      const orderPoints = Math.floor(orderAmount * multiplier);

      console.log(
        `➡️ Order #${order.orderNumber}: €${orderAmount} × ${multiplier} = ${orderPoints} pts`
      );

      // Update DB if needed
      if (order.pointsEarned !== orderPoints) {
        await prisma.order.update({
          where: { id: order.id },
          data: { pointsEarned: orderPoints },
        });
        console.log(`🟢 Updated DB: Order #${order.orderNumber} now ${orderPoints} pts`);
      }

      // Update Shopify metafield if possible
      if (!order.shopifyOrderId) {
        console.log(`⚠️ Order #${order.orderNumber} missing Shopify ID → skipping metafield`);
        continue;
      }

      await updateOrderMetafield(
        shopifyUrl,
        accessToken,
        order.shopifyOrderId,
        orderPoints,
        order.orderNumber
      );
    }
  }

  console.log("\n🎯 Done syncing order points.");
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error("❌ Script crashed:", err);
  prisma.$disconnect();
});
