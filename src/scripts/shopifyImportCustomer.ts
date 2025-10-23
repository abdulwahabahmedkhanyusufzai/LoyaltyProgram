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
        id: shopifyCustomerId, // Attach to real Shopify customer
      },
      email: orderData.Email,
      financial_status: "paid",
      currency: orderData.Currency || "EUR",
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

async function processCSV(filePath: string): Promise<Record<string, string>[]> {
  const orders: Record<string, string>[] = [];
  return new Promise<Record<string, string>[]>((resolve, reject) => {
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
      const email = order.Email?.trim();
      if (!email) {
        console.warn("⚠️ Skipping row — missing Email:", order);
        continue;
      }

      // 1️⃣ Find local customer by email
      const customer = await prisma.customer.findUnique({
        where: { email },
      });

      if (!customer) {
        console.warn(`⚠️ Customer not found in DB: ${email}`);
        continue;
      }

      // 2️⃣ Get the related shop (to use its access token)
      const shop = await prisma.shop.findFirst();

      if (!shop) {
        console.warn(`⚠️ Shop not found for customer ${email}`);
        continue;
      }

      // 3️⃣ Create the order on Shopify (real customer)
      const shopifyOrder = await createShopifyOrder(
        shop.shop,
        shop.accessToken,
        order,
        customer.shopifyId
      );

      console.log(`✅ Shopify order ${shopifyOrder.id} created for ${email}`);

      // 4️⃣ Store locally
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
      console.error(`❌ Error processing order for ${order.Email}:`, err.message);
    }
  }

  console.log("🎯 All orders processed and synced with Shopify!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  prisma.$disconnect();
});
