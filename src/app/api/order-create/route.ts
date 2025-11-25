import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { OrderStatus } from "@prisma/client";
import { runOffers } from "../../../scripts/cronAppOffer";
import { io } from "../../../../server/server";

const VERBOSE_DEBUG = process.env.DEBUG_SHOPIFY_WEBHOOK === "true";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
const SHOP = process.env.SHOPIFY_STORE_DOMAIN;

// =============================================================
//                    DEBUGGING UTILITIES
// =============================================================
let stepCounter = 0;
const startTime = Date.now();

function step(label: string, data: any = undefined) {
  stepCounter++;
  const elapsed = `${Date.now() - startTime}ms`;
  console.log(`\n🔍 [STEP ${stepCounter}] ${label} (+${elapsed})`);
  if (VERBOSE_DEBUG && data !== undefined) {
    try {
      console.log("🧩 Data:", JSON.stringify(data, null, 2));
    } catch {
      console.log("🧩 Data (raw):", data);
    }
  }
}

// =============================================================
// Tier Helpers
// =============================================================
function getTierByAmount(amountSpent: number) {
  step("Calculating Tier", { amountSpent });
  if (amountSpent >= 1000) return "Platinum";
  if (amountSpent >= 750) return "Gold";
  if (amountSpent >= 500) return "Silver";
  if (amountSpent >= 200) return "Bronze";
  return "Welcome";
}

function getTierPenalty(tier: string) {
  step("Getting Tier Penalty", { tier });
  switch (tier) {
    case "Bronze": return 200;
    case "Silver": return 500;
    case "Gold": return 750;
    case "Platinum": return 1000;
    default: return 0;
  }
}

// =============================================================
// Shopify metafield writer
// =============================================================
async function writeTierPenaltyMetafield(orderGid: string, penalty: number) {
  step("Writing Tier Penalty Metafield", { orderGid, penalty });

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

  step("Sending metafield mutation payload", variables);

  const response = await fetch(`https://${SHOP}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  step("Metafield Response", json);
}

// =============================================================
// Map Status
// =============================================================
const mapFinancialStatusToOrderStatus = (status?: string): OrderStatus => {
  step("Mapping financial_status → OrderStatus", { status });
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
    step("Webhook Execution Started");

    const secret = process.env.NEXT_SHOPIFY_API_SECRET;
    if (!secret) throw new Error("Missing SHOPIFY_API_SECRET");

    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    if (!hmacHeader) throw new Error("Missing HMAC header");

    const rawBody = await req.text();
    step("Raw Body Received", rawBody.slice(0, 500)); // avoid log spam

    // ----------------------------------------------------------------
    // HMAC VERIFICATION
    // ----------------------------------------------------------------
    step("Verifying HMAC Signature");
    const hash = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
    const hmacBuf = Buffer.from(hmacHeader, "base64");
    const hashBuf = Buffer.from(hash, "base64");

    if (
      hashBuf.length !== hmacBuf.length ||
      !crypto.timingSafeEqual(hashBuf, hmacBuf)
    ) {
      throw new Error("Unauthorized: HMAC verification failed");
    }
    step("HMAC Verified");

    const orderData = JSON.parse(rawBody);
    step("Parsed Order Payload", orderData);

    // ----------------------------------------------------------------
    // CUSTOMER VALIDATION
    // ----------------------------------------------------------------
    const customerEmail = orderData.customer?.email;
    if (!customerEmail) {
      step("Order missing email → skipping");
      return NextResponse.json({ message: "No customer email" }, { status: 200 });
    }

    step("Looking up customer in DB", { customerEmail });

    // ----------------------------------------------------------------
    // FIND OR CREATE CUSTOMER
    // ----------------------------------------------------------------
    let customer = await prisma.customer.findUnique({ where: { email: customerEmail } });

    if (!customer) {
      step("Customer Not Found → Creating New Customer");

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
    }
    step("Customer Loaded", customer);

    // ----------------------------------------------------------------
    // ORDER UNIQUENESS CHECK
    // ----------------------------------------------------------------
    step("Checking for duplicate order", { orderNumber: orderData.order_number });

    let order = await prisma.order.findUnique({
      where: { orderNumber: orderData.order_number.toString() },
    });

    if (!order) {
      step("Order Not Found → Creating Order");

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

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          numberOfOrders: { increment: 1 },
          amountSpent: { increment: parseFloat(orderData.total_price) },
        },
      });

      step("Order Saved + Customer Updated");

      const notification = await prisma.notification.create({
        data: {
          type: "order",
          title: "New Order Received",
          message: `Order #${order.orderNumber} was created.`,
          data: {
            orderNumber: order.orderNumber,
            amount: order.totalAmount,
            customer: customerEmail,
          },
        },
      });

      step("Broadcasting WebSocket Notification", notification);
      io.emit("NEW_NOTIFICATION", notification);

    }

    // ----------------------------------------------------------------
    // RELOAD CUSTOMER FOR UPDATED VALUES
    // ----------------------------------------------------------------
    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: customer.id },
    });

    step("Customer After Update", updatedCustomer);

    const discountAmount = parseFloat(orderData.total_discounts || "0");
    step("Checking Discount Amount", { discountAmount });

    // =============================================================
    //         DISCOUNT → TIER PENALTY LOGIC
    // =============================================================
    if (discountAmount > 0) {
      step("Discount Detected → Applying Tier Penalty");

      const tier = getTierByAmount(Number(updatedCustomer!.amountSpent));
      const penalty = getTierPenalty(tier);

      const lastLedger = await prisma.pointsLedger.findFirst({
        where: { customerId: customer.id },
        orderBy: { earnedAt: "desc" },
      });

      const currentBalance = lastLedger?.balanceAfter || 0;
      const newBalance = currentBalance - penalty;

      step("Ledger Before Penalty", { currentBalance, penalty, newBalance });

      await prisma.pointsLedger.create({
        data: {
          customerId: customer.id,
          change: -penalty,
          balanceAfter: newBalance,
          reason: `Tier penalty (${tier}) for discount`,
          sourceType: "WEBHOOK_ORDER",
        },
      });

      await writeTierPenaltyMetafield(order!.shopifyOrderId, penalty);

      step("Penalty Applied Successfully", { tier, penalty });

      return NextResponse.json(
        { message: "Discount: tier penalty applied" },
        { status: 200 }
      );
    }

    // =============================================================
    //         NO DISCOUNT → RUN OFFERS CRON
    // =============================================================
    step("No Discount → Running Offers Cron");
    await runOffers();

    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );

  } catch (error: any) {
    const fingerprint = crypto.randomUUID();
    console.error(`❌ Webhook Error [${fingerprint}]:`, error.message || error);
    if (VERBOSE_DEBUG) console.error(error.stack);
    return NextResponse.json(
      {
        message: "Internal server error",
        fingerprint,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
