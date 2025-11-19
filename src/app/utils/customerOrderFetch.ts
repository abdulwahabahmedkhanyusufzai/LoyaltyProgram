import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const runOrderPointsCron = async (verbose = true) => {
  const log = (msg: string, ...args: any[]) => verbose && console.log(msg, ...args);
  const warn = (msg: string, ...args: any[]) => console.warn(msg, ...args);
  const error = (msg: string, ...args: any[]) => console.error(msg, ...args);

  try {
    const startTime = Date.now();
    log("🚀 Starting Order Points Cron Job...");

    // 1️⃣ Get shop credentials
    const shopRecord = await prisma.shop.findFirst();
    if (!shopRecord) throw new Error("No shop found in DB");

    const { shop, accessToken } = shopRecord;
    const shopifyUrl = `https://${shop}/admin/api/2025-10/graphql.json`;
    log(`🟦 Shop credentials fetched: ${shop}`);

    // 2️⃣ Fetch orders without points
    const orders = await prisma.order.findMany({
      where: { pointsEarned: 0 },
      include: { 
        customer: {
          include: {
            pointsLedger: {
              orderBy: { earnedAt: 'desc' },
              take: 1
            }
          }
        }
      },
    });

    log(`🧾 Found ${orders.length} orders without points`);

    for (const order of orders) {
      const orderStart = Date.now();
      const customer = order.customer;
      const orderAmount = Number(order.totalAmount || 0);

      // ---- Determine tier multiplier based on amountSpent ----
      const amountSpent = Number(customer.amountSpent || 0);
      let tier = "Welcomed";
      if (amountSpent >= 200 && amountSpent < 500) tier = "Bronze";
      else if (amountSpent >= 500 && amountSpent < 750) tier = "Silver";
      else if (amountSpent >= 750 && amountSpent < 1000) tier = "Gold";
      else if (amountSpent >= 1000) tier = "Platinum";

      const multiplier = { Bronze: 1, Silver: 1.5, Gold: 2, Platinum: 2.5 }[tier] || 1;
      const points = Math.floor(orderAmount * multiplier);

      // ---- Update DB: pointsLedger + order pointsEarned ----
      await prisma.$transaction([
        prisma.pointsLedger.create({
          data: {
            customerId: customer.id,
            change: points,
            balanceAfter: (customer.pointsLedger?.[0]?.balanceAfter || 0) + points,
            reason: `Points for order ${order.orderNumber}`,
            sourceType: "ORDER",
            orderId: order.id,
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: { pointsEarned: points },
        }),
      ]);

      log(`🟢 Assigned ${points} points to order ${order.orderNumber}`);

      // ---- Shopify Order Metafield Update ----
      if (!order.shopifyOrderId) {
        warn(`⚠️ Skipping metafield update: No Shopify Order ID for order ${order.orderNumber}`);
        continue;
      }

      try {
        const mutation = `
          mutation OrderMetafieldAdd($input: OrderInput!) {
            orderUpdate(input: $input) {
              order { id metafields(first: 5) { edges { node { id key value type } } } }
              userErrors { field message }
            }
          }
        `;

        const input = {
          id: order.shopifyOrderId,
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
          headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
          body: JSON.stringify({ query: mutation, variables: { input } }),
        });

        const data = await res.json();
        if (data.data.orderUpdate.userErrors.length) {
          error(`❌ Shopify metafield errors for order ${order.orderNumber}:`, data.data.orderUpdate.userErrors);
        } else {
          log(`📦 Shopify metafield updated for order ${order.orderNumber}: ${points} points`);
        }
      } catch (err) {
        error(`❌ Shopify metafield update failed for order ${order.orderNumber}:`, err);
      }

      log(`✅ Finished processing order ${order.orderNumber} in ${(Date.now() - orderStart)}ms`);
    }

    log(`🎯 Order Points Cron completed in ${(Date.now() - startTime) / 1000}s`);
  } catch (err) {
    error("❌ Error in Order Points Cron:", err);
  } finally {
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  runOrderPointsCron()
    .then(() => console.log("✅ Cron finished"))
    .catch((err) => console.error("❌ Cron failed:", err));
}