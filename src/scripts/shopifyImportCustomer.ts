import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

/**
 * Create (or get) a Shopify customer by name & email
 */
async function getOrCreateShopifyCustomer(shop, accessToken, orderData) {
  const email = orderData.Email?.trim()?.toLowerCase();
  const firstName = (orderData.FirstName || orderData.Name || "").split(" ")[0] || "Customer";
  const lastName =
    (orderData.LastName || orderData.Name?.split(" ").slice(1).join(" ")) || "";

  // 🔹 Try to find customer in Shopify (by email)
  if (email) {
    try {
      const searchUrl = `https://${shop}/admin/api/2025-01/customers/search.json?query=email:${email}`;
      const searchRes = await axios.get(searchUrl, {
        headers: { "X-Shopify-Access-Token": accessToken },
      });

      if (searchRes.data.customers?.length > 0) {
        return searchRes.data.customers[0];
      }
    } catch {
      // ignore and create new
    }
  }

  // 🔹 Create customer in Shopify
  const createUrl = `https://${shop}/admin/api/2025-01/customers.json`;
  const payload = {
    customer: {
      first_name: firstName,
      last_name: lastName,
      email: email || `${firstName}.${Date.now()}@example.com`, // fallback email
    },
  };

  const res = await axios.post(createUrl, payload, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });

  return res.data.customer;
}

/**
 * Create order in Shopify
 */
async function createShopifyOrder(shop, accessToken, orderData, customerId) {
  const shopifyUrl = `https://${shop}/admin/api/2025-01/orders.json`;

  const payload = {
    order: {
      customer: { id: customerId },
      email: orderData.Email,
      financial_status: "paid",
      currency: orderData.Currency || "USD",
      line_items: [
        {
          title: orderData["Lineitem name"] || "Untitled Product",
          quantity: parseInt(orderData["Lineitem quantity"] || "1", 10),
          price: parseFloat(orderData["Lineitem price"] || "0"),
        },
      ],
      total_price: parseFloat(orderData.Total || "0"),
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

/**
 * Parse CSV into array of order objects
 */
async function processCSV(filePath:string): Promise<any[]> {
  const orders = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => orders.push(data))
      .on("end", () => resolve(orders))
      .on("error", reject);
  });
}

/**
 * Normalize names: lowercase, trim, remove accents and extra spaces
 */
function normalize(str = "") {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Main
 */
async function main(){
  const shop = await prisma.shop.findFirst();
  if (!shop) {
    console.error("❌ No shop found in database.");
    return;
  }

  console.log(`✅ Using shop: ${shop.shop}`);
  const orders = await processCSV("./orders_export.csv");

  for (const order of orders) {
    try {
      const name = order.Name || "";
      const email = order.Email || "";
      if (!name && !email) {
        console.warn("⚠️ Skipping row — missing Name and Email:", order);
        continue;
      }

      // 🧍 Match or create customer in Shopify directly
      const customer = await getOrCreateShopifyCustomer(shop.shop, shop.accessToken, order);
      console.log(`👤 Customer ready: ${customer.first_name} ${customer.last_name} (ID: ${customer.id})`);

      // 🛒 Create order for that customer
      const shopifyOrder = await createShopifyOrder(shop.shop, shop.accessToken, order, customer.id);
      console.log(`✅ Shopify order ${shopifyOrder.id} created for ${customer.first_name} ${customer.last_name}`);

      // 💾 Save order locally
      await prisma.order.create({
        data: {
          customerId: customer.id.toString(),
          shopId: shop.id,
          orderNumber: shopifyOrder.order_number?.toString() || "",
          totalAmount: parseFloat(shopifyOrder.total_price || "0"),
          currency: shopifyOrder.currency || "USD",
          status: "COMPLETED",
          metadata: shopifyOrder,
          createdAt: new Date(shopifyOrder.created_at),
          updatedAt: new Date(shopifyOrder.updated_at),
        },
      });
    } catch (err) {
      console.error(`❌ Error processing order for ${order.Name || order.Email}:`, err.message);
    }
  }

  console.log("🎯 All orders processed successfully!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  prisma.$disconnect();
});
