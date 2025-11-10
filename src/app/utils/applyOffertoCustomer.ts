import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const runLoyaltyCronJob = async () => {
  try {
    // 1️⃣ Get shop credentials
    const shopRecord = await prisma.shop.findFirst();
    if (!shopRecord) throw new Error("No shop found in DB");

    const { shop, accessToken } = shopRecord;
    const shopifyUrl = `https://${shop}/admin/api/2025-10/graphql.json`;

    // 2️⃣ Fetch customers with numberOfOrders > 0
    const customers = await prisma.customer.findMany();
    console.log(`🧾 Found ${customers.length} customers`);

    // Tier order for cumulative tags
    const tierOrder = ["Bronze", "Silver", "Gold", "Platinum"];

    for (const customer of customers) {
      const amountSpent = Number(customer.amountSpent || 0);

      // Fetch last PointsLedger entry safely
      const lastLedger = await prisma.pointsLedger.findFirst({
        where: { customerId: customer.id },
        orderBy: { earnedAt: "desc" },
      });
      const currentBalance = lastLedger?.balanceAfter || 0;

      // Determine tier + multiplier
      let tier = "Welcomed";
      let multiplier = 1;
      if (amountSpent >= 200 && amountSpent < 500) tier = "Bronze";
      else if (amountSpent >= 500 && amountSpent < 750) tier = "Silver";
      else if (amountSpent >= 750 && amountSpent < 1000) tier = "Gold";
      else if (amountSpent >= 1000) tier = "Platinum";

      switch (tier) {
        case "Bronze": multiplier = 1; break;
        case "Silver": multiplier = 1.5; break;
        case "Gold": multiplier = 2; break;
        case "Platinum": multiplier = 2.5; break;
      }

      const totalPoints = Math.floor(amountSpent * multiplier);

      // Skip if nothing changed
      if (customer.loyaltyTitle === tier && totalPoints === currentBalance) {
        console.log(`ℹ️ Skipped ${customer.firstName} (${tier}) — already up-to-date`);
        continue;
      }

      // ---- Update DB: Customer and PointsLedger ----
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: customer.email,
            points: totalPoints,
            tier,
            name: customer.firstName,
          }),
        });
        if (!response.ok) throw new Error(`Email API failed: ${response.status}`);
        console.log(`📧 Email sent to ${customer.email} (${tier}, ${totalPoints} pts)`);
      } catch (mailErr) {
        console.error(`❌ Failed to send email to ${customer.email}:`, mailErr);
      }

      // ---- Update Shopify customer tags safely ----
      try {
        // Get Shopify customer ID and existing tags
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
          // Build cumulative loyalty tags
          const index = tierOrder.indexOf(tier);
          const loyaltyTags = tierOrder.slice(0, index + 1);

          // Preserve non-loyalty tags
          const existingTags = shopCustomer.tags?.split(",").map((t: string) => t.trim()) || [];
          const nonLoyaltyTags = existingTags.filter((t: string) => !tierOrder.includes(t));
          const tagsToApply = [...nonLoyaltyTags, ...loyaltyTags];

          // Update Shopify tags via GraphQL
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
        } else {
          console.warn(`⚠️ Shopify customer not found: ${customer.email}`);
        }
      } catch (err) {
        console.error(`❌ Shopify update failed for ${customer.email}:`, err);
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
