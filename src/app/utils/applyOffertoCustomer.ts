import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const runLoyaltyCronJob = async (verbose = true) => {
  const log = (msg: string, ...args: any[]) => verbose && console.log(msg, ...args);
  const warn = (msg: string, ...args: any[]) => console.warn(msg, ...args);
  const error = (msg: string, ...args: any[]) => console.error(msg, ...args);

  try {
    const startTime = Date.now();
    log("🚀 Starting Loyalty Cron Job...");

    // 1️⃣ Get shop credentials
    const shopRecord = await prisma.shop.findFirst();
    if (!shopRecord) throw new Error("No shop found in DB");

    const { shop, accessToken } = shopRecord;
    const shopifyUrl = `https://${shop}/admin/api/2025-10/graphql.json`;
    log(`🟦 Shop credentials fetched: ${shop}`);

    // 2️⃣ Fetch eligible customers
    const customers = await prisma.customer.findMany({
      where: { numberOfOrders: { gt: 0 } },
      include: {
        pointsLedger: { orderBy: { earnedAt: "desc" }, take: 1 },
        orders: true,
      },
    });
    log(`🧾 Found ${customers.length} customers`);

    const tierOrder = ["Bronze", "Silver", "Gold", "Platinum"];

    for (const customer of customers) {
      const customerStart = Date.now();
      log(`\n🔹 Processing customer: ${customer.email} (ID: ${customer.id})`);

      const amountSpent = Number(customer.amountSpent || 0);
      const lastEntry = customer.pointsLedger[0];
      let currentBalance = lastEntry?.balanceAfter || 0;

      // ---- Determine tier + multiplier ----
      let tier = "Welcomed";
      if (amountSpent >= 200 && amountSpent < 500) tier = "Bronze";
      else if (amountSpent >= 500 && amountSpent < 750) tier = "Silver";
      else if (amountSpent >= 750 && amountSpent < 1000) tier = "Gold";
      else if (amountSpent >= 1000) tier = "Platinum";

      const multiplier = { Bronze: 1, Silver: 1.5, Gold: 2, Platinum: 2.5 }[tier] || 1;
      const totalPoints = Math.floor(amountSpent * multiplier);
      log(`💰 Amount spent: €${amountSpent}, Tier: ${tier}, Multiplier: ${multiplier}, Total points: ${totalPoints}`);

      // ---- Assign points per order ----
      if (customer.numberOfOrders > 1 && customer.orders?.length) {
       for (const order of customer.orders) {
  const orderAmount = Number(order.totalAmount || 0);
  const orderPoints = Math.floor(orderAmount * multiplier);

  if (order.pointsEarned !== orderPoints) {
    await prisma.$transaction([
      prisma.pointsLedger.create({
        data: {
          customerId: customer.id,
          change: orderPoints - (order.pointsEarned || 0),
          balanceAfter: currentBalance + orderPoints - (order.pointsEarned || 0),
          reason: `Points from order ${order.orderNumber}`,
          sourceType: "ORDER",
          orderId: order.id,
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { pointsEarned: orderPoints },
      }),
    ]);

    currentBalance += orderPoints - (order.pointsEarned || 0);
    log(`🟢 Assigned ${orderPoints} pts for order ${order.orderNumber}`);

    // ---- Shopify Order Metafield Update ----
    try {
      const orderInput = {
        id: order.shopifyOrderId, // make sure you store the Shopify order ID in your DB
        metafields: [
          {
            namespace: "loyalty",
            key: "points",
            type: "number_integer",
            value: orderPoints.toString(),
          },
        ],
      };

      const mutation = `
        mutation OrderMetafieldAdd($input: OrderInput!) {
          orderUpdate(input: $input) {
            order {
              id
              metafields(first: 5) {
                edges {
                  node {
                    id
                    namespace
                    key
                    value
                    type
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

      const res = await fetch(shopifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query: mutation, variables: { input: orderInput } }),
      });

      const data = await res.json();
      if (data.data.orderUpdate.userErrors.length) {
        console.error(`❌ Shopify Order Metafield Errors for order ${order.orderNumber}:`, data.data.orderUpdate.userErrors);
      } else {
        console.log(`📦 Order ${order.orderNumber} metafield updated: ${orderPoints} points`);
      }
    } catch (err) {
      console.error(`❌ Shopify Order Metafield update failed for order ${order.orderNumber}:`, err);
    }
  } else {
    log(`ℹ️ Order ${order.orderNumber} already has ${order.pointsEarned} pts`);
  }
}

      }

      // ---- Skip if already up-to-date ----
      if (customer.loyaltyTitle === tier && totalPoints === currentBalance) {
        log(`ℹ️ Customer ${customer.email} already up-to-date`);
        continue;
      }

      // ---- Update DB (customer + points ledger) ----
      await prisma.$transaction([
        prisma.customer.update({
          where: { id: customer.id },
          data: { loyaltyTitle: tier, updatedAt: new Date() },
        }),
        prisma.pointsLedger.create({
          data: {
            customerId: customer.id,
            change: totalPoints - currentBalance,
            balanceAfter: totalPoints,
            reason: "Automatic Loyalty Update",
            sourceType: "CRON_JOB",
          },
        }),
      ]);
      log(`📝 Updated DB for ${customer.email} → Tier: ${tier}, Points: ${totalPoints}`);

      // ---- Send email notification ----
      try {
        const emailRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: customer.email,
            points: totalPoints,
            tier,
            name: customer.firstName,
          }),
        });
        if (!emailRes.ok) throw new Error(`Email API failed: ${emailRes.status}`);
        log(`📧 Email sent to ${customer.email}`);
      } catch (mailErr) {
        error(`❌ Failed to send email to ${customer.email}:`, mailErr);
      }

      // ---- Shopify customer fetch ----
      let shopCustomer: { id: string; tags: string[] } | null = null;
      try {
        const query = `
          query ($email: String!) { customers(first: 1, query: $email) { edges { node { id tags } } } }
        `;
        const res = await fetch(shopifyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
          body: JSON.stringify({ query, variables: { email: customer.email } }),
        });
        const data = await res.json();
        shopCustomer = data?.data?.customers?.edges[0]?.node;
        if (!shopCustomer) warn(`⚠️ Shopify customer not found: ${customer.email}`);
      } catch (err) {
        error(`❌ Shopify fetch failed for ${customer.email}:`, err);
      }

      if (!shopCustomer) continue;

      // ---- Update Shopify tags ----
      try {
        const tagsToApply = tierOrder.slice(0, tierOrder.indexOf(tier) + 1);
        const mutation = `
          mutation ($id: ID!, $tags: [String!]!) {
            customerUpdate(input: { id: $id, tags: $tags }) { customer { id tags } userErrors { field message } }
          }
        `;
        const res = await fetch(shopifyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
          body: JSON.stringify({ query: mutation, variables: { id: shopCustomer.id, tags: tagsToApply } }),
        });
        const data = await res.json();
        console.log(`🏷️ Shopify tag update response for ${customer.email}:`, JSON.stringify(data, null, 2));
        if (data.data.customerUpdate.userErrors.length) error("❌ Shopify tag errors:", data.data.customerUpdate.userErrors);
        else log(`🏷️ Tags updated: ${tagsToApply.join(", ")}`);
      } catch (err) {
        error(`❌ Shopify tag update failed for ${customer.email}:`, err);
      }

      // ---- Update Shopify metafields ----
      try {
        const mutation = `
          mutation updateCustomerMetafields($input: CustomerInput!) {
            customerUpdate(input: $input) {
              customer {
                id
                metafields(first: 3) {
                  edges { node { id namespace key value } }
                }
              }
              userErrors { message field }
            }
          }
        `;

        const input = {
          id: shopCustomer.id,
          metafields: [
            { namespace: "loyalty", key: "points", type: "number_integer", value: totalPoints.toString() },
            { namespace: "loyalty", key: "tier", type: "single_line_text_field", value: tier },
          ],
        };

        const res = await fetch(shopifyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
          body: JSON.stringify({ query: mutation, variables: { input } }),
        });

        const data = await res.json();
        console.log("📦 Shopify metafield update response:", JSON.stringify(data, null, 2));

        if (data.errors?.length) error(`❌ Shopify GraphQL errors:`, data.errors);
        if (data.data?.customerUpdate?.userErrors?.length) error(`❌ Shopify userErrors:`, data.data.customerUpdate.userErrors);
        else log(`📦 Metafields updated successfully for ${customer.email}`);
      } catch (err) {
        error(`❌ Shopify metafield update failed for ${customer.email}:`, err);
      }

      log(`✅ Finished processing ${customer.email} in ${(Date.now() - customerStart)}ms`);
    }

    log(`🎯 Loyalty cron completed successfully in ${(Date.now() - startTime) / 1000}s`);
  } catch (err) {
    error("❌ Error in loyalty cron:", err);
  } finally {
    await prisma.$disconnect();
  }
};
