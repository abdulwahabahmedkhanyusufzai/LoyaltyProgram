import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const runLoyaltyCronJob = async () => {
  try {
    // 1️⃣ Get shop credentials
    const shopRecord = await prisma.shop.findFirst();
    if (!shopRecord) throw new Error("No shop found in DB");

    const { shop, accessToken } = shopRecord;
    const shopifyUrl = `https://${shop}/admin/api/2025-10/graphql.json`;

    // 2️⃣ Fetch eligible customers
    const customers = await prisma.customer.findMany({
      where: { numberOfOrders: { gt: 0 } },
      include: {
        pointsLedger: { orderBy: { earnedAt: "desc" }, take: 1 },
        orders: true,
      },
    });

    console.log(`🧾 Found ${customers.length} customers`);

    const tierOrder = ["Bronze", "Silver", "Gold", "Platinum"];

    for (const customer of customers) {
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
            console.log(`🟢 Assigned ${orderPoints} pts for order ${order.orderNumber} (${customer.email})`);
          }
        }
      }

      // ---- Skip if already up-to-date ----
      if (customer.loyaltyTitle === tier && totalPoints === currentBalance) {
        console.log(`ℹ️ Skipped ${customer.firstName} — already up-to-date`);
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
        console.log(`📧 Email sent to ${customer.email} (${tier}, ${totalPoints} pts)`);
      } catch (mailErr) {
        console.error(`❌ Failed to send email to ${customer.email}:`, mailErr);
      }

      // ---- Fetch Shopify customer once and reuse ----
      let shopCustomer: { id: string; tags: string[] } | null = null;
      try {
        const getCustomerQuery = `
          query ($email: String!) {
            customers(first: 1, query: $email) {
              edges { node { id tags } }
            }
          }
        `;
        const customerRes = await fetch(shopifyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({ query: getCustomerQuery, variables: { email: customer.email } }),
        });
        shopCustomer = (await customerRes.json())?.data?.customers?.edges[0]?.node;

        if (!shopCustomer) {
          console.warn(`⚠️ Shopify customer not found: ${customer.email}`);
          continue;
        }
      } catch (err) {
        console.error(`❌ Shopify customer fetch failed for ${customer.email}:`, err);
        continue;
      }

      // ---- Update Shopify tags ----
      try {
        const tagsToApply = tierOrder.slice(0, tierOrder.indexOf(tier) + 1);
        const updateTagsMutation = `
          mutation ($id: ID!, $tags: [String!]!) {
            customerUpdate(input: { id: $id, tags: $tags }) {
              customer { id tags }
              userErrors { field message }
            }
          }
        `;
        const updateTagsRes = await fetch(shopifyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({ query: updateTagsMutation, variables: { id: shopCustomer.id, tags: tagsToApply } }),
        });
        const updateData = await updateTagsRes.json();
        if (updateData.data.customerUpdate.userErrors.length)
          console.error(`❌ Shopify tag update errors:`, updateData.data.customerUpdate.userErrors);
      } catch (err) {
        console.error(`❌ Shopify tag update failed for ${customer.email}:`, err);
      }

      // ---- Update Shopify metafields ----
      try {
        const updateMetaMutation = `
          mutation updateCustomerMetafields($id: ID!, $points: Int!, $tier: String!) {
            customerUpdate(input: {
              id: $id,
              metafields: [
                { namespace: "loyalty", key: "points", type: "number_integer", value: $points },
                { namespace: "loyalty", key: "tier", type: "single_line_text_field", value: $tier }
              ]
            }) {
              customer { id }
              userErrors { field message }
            }
          }
        `;
        const updateMetaRes = await fetch(shopifyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({ query: updateMetaMutation, variables: { id: shopCustomer.id, points: totalPoints, tier } }),
        });
        const metaData = await updateMetaRes.json();
        if (metaData.data.customerUpdate.userErrors.length)
          console.error(`❌ Metafield update errors:`, metaData.data.customerUpdate.userErrors);
        else
          console.log(`📦 Metafields updated for ${customer.email}: ${tier} (${totalPoints} pts)`);
      } catch (metaErr) {
        console.error(`❌ Failed to update metafields for ${customer.email}:`, metaErr);
      }

      console.log(`✅ Updated ${customer.firstName} → ${tier} (${totalPoints} pts)`);
    }

    console.log("🎯 Loyalty cron completed successfully.");
  } catch (error) {
    console.error("❌ Error in loyalty cron:", error);
  } finally {
    await prisma.$disconnect();
  }
};
