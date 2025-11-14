import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { OrderStatus } from "@prisma/client";
import { runOffers } from "../../../scripts/cronAppOffer";

const VERBOSE_DEBUG = process.env.DEBUG_SHOPIFY_WEBHOOK === "true";

interface ShopifyOrder {
  id: number | string;
  order_number: string | number;
  total_price: string;
  currency: string;
  financial_status?: string;
  total_discounts?: string; // Discount amount
  customer?: {
    id: any;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  created_at?: string;
  [key: string]: any;
}

const mapFinancialStatusToOrderStatus = (status?: string): OrderStatus => {
  switch (status?.toUpperCase()) {
    case "PAID": return OrderStatus.COMPLETED;
    case "REFUNDED": return OrderStatus.REFUNDED;
    case "CANCELLED": return OrderStatus.CANCELLED;
    default: return OrderStatus.PENDING;
  }
};

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

    const orderData: ShopifyOrder = JSON.parse(body);
    if (VERBOSE_DEBUG) console.log("📦 Incoming order data:", JSON.stringify(orderData, null, 2));

    const customerEmail = orderData.customer?.email;
    if (!customerEmail) {
      console.warn("⚠️ Order has no customer email. Skipping customer update.");
      return NextResponse.json({ message: "No customer email" }, { status: 200 });
    }

    // --- Find or create customer ---
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
    } else if (VERBOSE_DEBUG) {
      console.log(`ℹ️ Existing customer found: ${customer.email}`);
    }

    // --- Check for duplicate order ---
    let order = await prisma.order.findUnique({
      where: { orderNumber: orderData.order_number.toString() },
    });

    if (order) {
      console.log(`ℹ️ Order ${order.orderNumber} already exists. Skipping creation.`);
    } else {
      order = await prisma.order.create({
        data: {
          customerId: customer.id,
          orderNumber: orderData.order_number.toString(),
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

      console.log(`✅ Order ${order.orderNumber} saved for customer ${customer.email}`);
    }

    // --- Deduct points if discount applied ---
    const discountAmount = parseFloat(orderData.total_discounts || "0");
    if (discountAmount > 0) {
      const lastLedger = await prisma.pointsLedger.findFirst({
        where: { customerId: customer.id },
        orderBy: { earnedAt: "desc" },
      });
      const currentBalance = lastLedger?.balanceAfter || 0;
      const newBalance = currentBalance - discountAmount;

      await prisma.pointsLedger.create({
        data: {
          customerId: customer.id,
          change: -discountAmount,
          balanceAfter: newBalance,
          reason: "Discount applied",
          sourceType: "WEBHOOK_ORDER",
        },
      });

      console.log(`🟠 Deducted ${discountAmount} points from ${customer.email}. New balance: ${newBalance}`);
      console.log("ℹ️ Discount applied, skipping offers cron job.");
    } else {
      // --- Run Offers Cron Job only if no discount ---
      try {
        console.log("🚀 Running offers cron job...");
        await runOffers();
        console.log("✅ Offers cron job executed successfully.");
      } catch (cronError) {
        console.error("❌ Error running offers cron job:", cronError);
      }
    }

    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error processing webhook:", error.message || error);
    if (VERBOSE_DEBUG) console.error(error.stack);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
