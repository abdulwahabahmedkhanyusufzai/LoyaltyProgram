import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

async function createShopifyOrder(shop, accessToken, orderData, shopifyCustomerId) {
  const shopifyUrl = `https://${shop}/admin/api/2025-01/orders.json`;

  const payload = {
    order: {
      customer: {
        id: shopifyCustomerId,
      },
      email: orderData.Email,
      financial_status: "paid",
      currency: orderData.Currency || "USD",
      line_items: [
        {
          title: orderData["Lineitem name"],
          quantity: parseInt(orderData["Lineitem quantity"] || 1),
          price: parseFloat(orderData["Lineitem price"] || 0),
        },
      ],
      total_price: parseFloat(orderData.Total || 0),
      send_receipt: false,
      send_fulfillment_receipt: false,
    },
  };

  const res = await axios.post(shopifyUrl, payload, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });

  return res.data.order;
}

async function processCSV(filePath: string): Promise<any[]> {
  const orders: any[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => orders.push(data))
      .on("end", () => resolve(orders))
      .on("error", reject);
  });
}

async function main() {
  // 1️⃣ Get your shop (since only one)
  const shop = await prisma.shop.findFirst();
  if (!shop) {
    console.error("❌ No shop found in database.");
    return;
  }

  console.log(`✅ Using shop: ${shop.shop}`);

  // 2️⃣ Read CSV
  const orders = await processCSV("./orders_export.csv");

  for (const order of orders) {
    try {
      const fullName = order.Name?.trim();
      if (!fullName) {
        console.warn("⚠️ Skipping row — missing Name:", order);
        continue;
      }

      // 3️⃣ Split into first and last names
      const [firstName, ...rest] = fullName.split(" ");
      const lastName = rest.join(" ").trim();

      // 4️⃣ Match customer by firstName + lastName
      const customer = await prisma.customer.findFirst({
        where: {
          AND: [
            {
              firstName: { equals: firstName, mode: "insensitive" },
            },
            {
              lastName: { equals: lastName, mode: "insensitive" },
            },
          ],
        },
      });

      if (!customer) {
        console.warn(`⚠️ No matching customer found in DB for: ${firstName} ${lastName}`);
        continue;
      }

      // 5️⃣ Create Shopify order for this customer
      const shopifyOrder = await createShopifyOrder(
        shop.shop,
        shop.accessToken,
        order,
        customer.shopifyId
      );

      console.log(`✅ Shopify order ${shopifyOrder.id} created for ${firstName} ${lastName}`);

      // 6️⃣ Save order locally in DB
      await prisma.order.create({
        data: {
          customerId: customer.id,
          shopId: shop.id,
          orderNumber: shopifyOrder.order_number.toString(),
          totalAmount: shopifyOrder.total_price,
          currency: shopifyOrder.currency,
          status: "COMPLETED",
          metadata: shopifyOrder,
          createdAt: new Date(shopifyOrder.created_at),
          updatedAt: new Date(shopifyOrder.updated_at),
        },
      });
    } catch (err) {
      console.error(`❌ Error processing ${order.Name}:`, err.message);
    }
  }

  console.log("🎯 All orders processed successfully!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  prisma.$disconnect();
});
