import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const runLoyaltyCronJob = async () => {
  try {
    // 1️⃣ Get shop credentials from DB
    const shopRecord = await prisma.shop.findFirst();
    if (!shopRecord) throw new Error("No shop found in DB");

    const { shop, accessToken } = shopRecord;
    const shopifyUrl = `https://${shop}/admin/api/2025-10/graphql.json`;

    // 2️⃣ Fetch customers
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          orderBy: { createdAt: "asc" },
          include: { pointsLedger: true },
        },
        pointsLedger: { orderBy: { earnedAt: "desc" }, take: 1 },
      },
    });

    console.log(`🧾 Found ${customers.length} customers`);

    const tierOrder = ["Bronze", "Silver", "Gold", "Platinum"];

    for (const customer of customers) {
      let totalPoints = 0;
      let cumulativeSpent = 0;

      // Process each order to calculate points individually
      for (const order of customer.orders) {
        // Skip if points already awarded for this order
        if (order.pointsEarned > 0) {
          totalPoints += order.pointsEarned;
          cumulativeSpent += Number(order.totalAmount);
          continue;
        }

        // Determine tier for this order
        let tier = "Welcomed";
        let multiplier = 1;
        const orderAmount = Number(order.totalAmount);
        const newCumulativeSpent = cumulativeSpent + orderAmount;

        if (newCumulativeSpent >= 200 && newCumulativeSpent < 500) tier = "Bronze";
        else if (newCumulativeSpent >= 500 && newCumulativeSpent < 750) tier = "Silver";
        else if (newCumulativeSpent >= 750 && newCumulativeSpent < 1000) tier = "Gold";
        else if (newCumulativeSpent >= 1000) tier = "Platinum";

        switch (tier) {
          case "Bronze": multiplier = 1; break;
          case "Silver": multiplier = 1.5; break;
          case "Gold": multiplier = 2; break;
          case "Platinum": multiplier = 2.5; break;
        }

        const orderPoints = Math.floor(orderAmount * multiplier);

        // Update order points
        await prisma.order.update({
          where: { id: order.id },
          data: { pointsEarned: orderPoints },
        });

        // Add to points ledger
        const lastLedger = customer.pointsLedger[0];
        const currentBalance = lastLedger?.balanceAfter || 0;
        const newBalance = currentBalance + orderPoints;

        await prisma.pointsLedger.create({
          data: {
            customerId: customer.id,
            change: orderPoints,
            balanceAfter: newBalance,
            reason: `Points from order ${order.orderNumber}`,
            sourceType: "CRON_JOB",
            orderId: order.id,
          },
        });

        totalPoints += orderPoints;
        cumulativeSpent += orderAmount;
      }

      // Determine overall tier based on cumulativeSpent
      let tier = "Welcomed";
      if (cumulativeSpent >= 200 && cumulativeSpent < 500) tier = "Bronze";
      else if (cumulativeSpent >= 500 && cumulativeSpent < 750) tier = "Silver";
      else if (cumulativeSpent >= 750 && cumulativeSpent < 1000) tier = "Gold";
      else if (cumulativeSpent >= 1000) tier = "Platinum";

      // Only update customer if tier changed
      if (customer.loyaltyTitle !== tier || customer.pointsLedger[0]?.balanceAfter !== totalPoints) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { loyaltyTitle: tier, updatedAt: new Date() },
        });
      }

      console.log(`✅ Updated ${customer.firstName} → ${tier} (${totalPoints} pts)`);

      // --- Optional: update Shopify tags per customer ---
      try {
        const getCustomerQuery = `
          query ($email: String!) {
            customers(first: 1, query: $email) {
              edges {
                node { id tags }
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
          body: JSON.stringify({ query: getCustomerQuery, variables: { email: customer.email } }),
        });
        const data = await res.json();
        const shopCustomer = data?.data?.customers?.edges[0]?.node;

        if (shopCustomer) {
          const index = tierOrder.indexOf(tier);
          const tagsToApply = tierOrder.slice(0, index + 1);

          const updateTagsMutation = `
            mutation ($id: ID!, $tags: [String!]!) {
              customerUpdate(input: { id: $id, tags: $tags }) {
                customer { id tags }
                userErrors { field message }
              }
            }
          `;
          const updateRes = await fetch(shopifyUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": accessToken,
            },
            body: JSON.stringify({ query: updateTagsMutation, variables: { id: shopCustomer.id, tags: tagsToApply } }),
          });
          const updateData = await updateRes.json();
          if (updateData.data.customerUpdate.userErrors.length) {
            console.error(`❌ Shopify tag update errors:`, updateData.data.customerUpdate.userErrors);
          }
        }
      } catch (err) {
        console.error(`❌ Shopify update failed for ${customer.email}:`, err);
      }
    }

    console.log("🎯 Loyalty cron completed successfully.");
  } catch (error) {
    console.error("❌ Error in loyalty cron:", error);
  } finally {
    await prisma.$disconnect();
  }
};
