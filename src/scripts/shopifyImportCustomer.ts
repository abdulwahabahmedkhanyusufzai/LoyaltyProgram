import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

// ✅ Create a Shopify order linked to a specific customer
async function createShopifyOrder(shop, accessToken, orderData, shopifyCustomerId) {
  const shopifyUrl = `https://${shop}/admin/api/2025-01/orders.json`;

  const payload = {
    order: {
      line_items: [
        {
          title: orderData.product_name,
          quantity: parseInt(orderData.quantity || 1),
          price: orderData.price,
        },
      ],
      customer: {
        id: shopifyCustomerId, // <-- Attach to the real Shopify customer
      },
      email: orderData.email,
      financial_status: "paid",
      currency: orderData.currency || "EUR",
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

// ✅ Parse the CSV
async function processCSV(filePath: string): Promise<Record<string, string>[]> {
  const orders: Record<string, string>[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data: Record<string, string>) => orders.push(data))
      .on("end", () => resolve(orders))
      .on("error", reject);
  });
}

async function main() {
  const orders = await processCSV("./orders_export.csv");

  for (const order of orders) {
    try {
      // 1️⃣ Find local customer by email
      const customer = await prisma.customer.findUnique({
        where: { email: order.email },
      });

      if (!customer) {
        console.warn(`⚠️ Customer not found in DB: ${order.email}`);
        continue;
      }

      // 2️⃣ Get their associated shop
      const shop = await prisma.shop.findFirst();

      if (!shop) {
        console.warn(`⚠️ Shop not found for ${order.email}`);
        continue;
      }

      // 3️⃣ Create the order in Shopify
      const shopifyOrder = await createShopifyOrder(
        shop.shop,
        shop.accessToken,
        order,
        customer.shopifyId // <-- this is the real Shopify customer ID
      );

      console.log(
        `✅ Created Shopify order ${shopifyOrder.id} for ${customer.email}`
      );

      // 4️⃣ Save it to your local DB
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
      console.error(`❌ Error processing ${order.email}:`, err.message);
    }
  }

  console.log("🎯 All CSV orders have been processed and synced!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Fatal:", e);
  prisma.$disconnect();
});
