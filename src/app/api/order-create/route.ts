import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { OrderStatus } from "@prisma/client";
import { runOffers } from "../../../scripts/cronAppOffer";

const VERBOSE_DEBUG = process.env.DEBUG_SHOPIFY_WEBHOOK === "true";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
const SHOP = process.env.SHOPIFY_STORE_DOMAIN;

// ----------------------
// Tier Helpers
// ----------------------
function getTierByAmount(amountSpent: number) {
  if (amountSpent >= 1000) return "Platinum";
  if (amountSpent >= 750) return "Gold";
  if (amountSpent >= 500) return "Silver";
  if (amountSpent >= 200) return "Bronze";
  return "Welcome";
}

function getTierPenalty(tier: string) {
  switch (tier) {
    case "Bronze": return 200;
    case "Silver": return 500;
    case "Gold": return 750;
    case "Platinum": return 1000;
    default: return 0;
  }
}

// ----------------------
// Shopify metafield writer
// ----------------------
async function writeTierPenaltyMetafield(orderGid: string, penalty: number) {
  if (!ADMIN_TOKEN || !SHOP) {
    console.warn("⚠️ Missing Shopify admin API credentials.");
    return;
  }

  const query = `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id key namespace value }
        userErrors { field message }
      }
    }
  `;

  const variables = {
    metafields: [
      {
        ownerId: orderGid,
        namespace: "loyalty",
        key: "tier_penalty",
        type: "number_integer",
        value: (-penalty).toString(),
      },
    ],
  };

  const response = await fetch(`https://${SHOP}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (VERBOSE_DEBUG) console.log("📝 Metafield write response:", JSON.stringify(json, null, 2));
}

// ----------------------
// Map Status
// ----------------------
const mapFinancialStatusToOrderStatus = (status?: string): OrderStatus => {
  switch (status?.toUpperCase()) {
    case "PAID": return OrderStatus.COMPLETED;
    case "REFUNDED": return OrderStatus.REFUNDED;
    case "CANCELLED": return OrderStatus.CANCELLED;
    default: return OrderStatus.PENDING;
  }
};

// =============================================================
//                     MAIN WEBHOOK HANDLER
// =============================================================
export async function POST(req: Request): Promise<Response> {
  try {
    const secret = process.env.NEXT_SHOPIFY_API_SECRET;
    if (!secret) throw new Error("Server misconfiguration: missing SHOPIFY_API_SECRET");

    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    if (!hmacHeader) throw new Error("Missing HMAC header");

    const body = await req.text();

    // HMAC verification
    const hash = crypto.createHmac("sha256", secret).update(body, "utf8").digest("base64");
    const hmacBuffer = Buffer.from(hmacHeader, "base64");
    const hashBuffer = Buffer.from(hash, "base64");

    if (hashBuffer.length !== hmacBuffer.length || !crypto.timingSafeEqual(hashBuffer, hmacBuffer)) {
      throw new Error("Unauthorized: HMAC verification failed");
    }
    if (VERBOSE_DEBUG) console.log("✅ HMAC verified");

    const orderData = JSON.parse(body);

    const customerEmail = orderData.customer?.email;
    if (!customerEmail) {
      console.warn("⚠️ Order has no customer email. Skipping customer update.");
      return NextResponse.json({ message: "No customer email" }, { status: 200 });
    }

    // -------- Find or Create Customer --------
    let customer = await prisma.customer.findUnique({ where: { email: customerEmail } });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email: customerEmail,
          firstName: orderData.customer?.first_name || "Unknown",
          lastName: orderData.customer?.last_name || "Unknown",
          numberOfOrders: 0,
          amountSpent: 0,
          shopifyId: orderData.customer?.id?.toString() || crypto.randomUUID(),
        },
      });
      console.log(`✅ Created new customer: ${customer.email}`);
    }

    // -------- Check Duplicate Order --------
    let order = await prisma.order.findUnique({
      where: { orderNumber: orderData.order_number.toString() },
    });

    if (!order) {
      // 1️⃣ Create the order first
      order = await prisma.order.create({
        data: {
          customerId: customer.id,
          orderNumber: orderData.order_number.toString(),
          shopifyOrderId: `gid://shopify/Order/${orderData.id}`,
          totalAmount: parseFloat(orderData.total_price),
          currency: orderData.currency || "EUR",
          status: mapFinancialStatusToOrderStatus(orderData.financial_status),
          createdAt: orderData.created_at ? new Date(orderData.created_at) : new Date(),
        },
      });

      // 2️⃣ Update customer totals including this order
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          numberOfOrders: { increment: 1 },
          amountSpent: { increment: parseFloat(orderData.total_price) },
        },
      });

      console.log(`✅ Order ${order.orderNumber} saved for customer ${customer.email}`);
    }

    // -------- Get updated customer for tier calculation --------
    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: customer.id },
    });

    const discountAmount = parseFloat(orderData.total_discounts || "0");

    // =============================================================
    //                     Tier-based deduction if discount
    // =============================================================
    if (discountAmount > 0) {
      console.log("🟠 Discount detected → applying tier penalty");

      const tier = getTierByAmount(Number(updatedCustomer!.amountSpent));
      const penalty = getTierPenalty(tier);

      const lastLedger = await prisma.pointsLedger.findFirst({
        where: { customerId: customer.id },
        orderBy: { earnedAt: "desc" },
      });

      const currentBalance = lastLedger?.balanceAfter || 0;
      const newBalance = currentBalance - penalty;

      // 3️⃣ Create points ledger entry
      await prisma.pointsLedger.create({
        data: {
          customerId: customer.id,
          change: -penalty,
          balanceAfter: newBalance,
          reason: `Tier penalty (${tier}) for discount`,
          sourceType: "WEBHOOK_ORDER",
        },
      });

      // 4️⃣ Write metafield to Shopify order
      await writeTierPenaltyMetafield(order!.shopifyOrderId, penalty);

      console.log(`⚡ Tier: ${tier}, Penalty Applied: ${penalty} points`);
      console.log("ℹ️ Discount applied → skipping offers cron");

      return NextResponse.json({ message: "Discount: tier penalty applied" }, { status: 200 });
    }

    // =============================================================
    //                     No discount → run offers cron
    // =============================================================
    console.log("🚀 Running Offers Cron (no discount used)...");
    await runOffers();

    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Webhook error:", error.message || error);
    if (VERBOSE_DEBUG) console.error(error.stack);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
