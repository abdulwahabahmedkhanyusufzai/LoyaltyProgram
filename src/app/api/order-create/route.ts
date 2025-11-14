import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { OrderStatus } from "@prisma/client";

const VERBOSE_DEBUG = process.env.DEBUG_SHOPIFY_WEBHOOK === "true";

interface ShopifyOrder {
  id: number | string;
  order_number: string | number;
  total_price: string;
  currency: string;
  financial_status?: string;
  customer?: {
    id: any;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  created_at?: string;
  [key: string]: any;
}

// Map Shopify financial_status to Prisma OrderStatus enum
const mapFinancialStatusToOrderStatus = (status?: string): OrderStatus => {
  switch (status?.toUpperCase()) {
    case "PAID":
      return OrderStatus.COMPLETED;
    case "REFUNDED":
      return OrderStatus.REFUNDED;
    case "CANCELLED":
      return OrderStatus.CANCELLED;
    default:
      return OrderStatus.PENDING;
  }
};

export async function POST(req: Request): Promise<Response> {
  try {
    const secret = process.env.NEXT_SHOPIFY_API_SECRET;
    if (!secret) return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });

    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    if (!hmacHeader) return NextResponse.json({ message: "Missing HMAC header" }, { status: 400 });

    const body = await req.text();

    // Verify HMAC
    const hash = crypto.createHmac("sha256", secret).update(body, "utf8").digest("base64");
    const hashBuffer = Buffer.from(hash, "base64");
    const hmacBuffer = Buffer.from(hmacHeader, "base64");
    const valid = hashBuffer.length === hmacBuffer.length && crypto.timingSafeEqual(hashBuffer, hmacBuffer);
    if (!valid) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const orderData: ShopifyOrder = JSON.parse(body);
    const customerEmail = orderData.customer?.email;

    if (!customerEmail) {
      console.warn("⚠️ Order has no customer email. Skipping customer update.");
      return NextResponse.json({ message: "No customer email" }, { status: 200 });
    }

    // Find or create customer
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
      console.log("✅ Created new customer:", customer.email);
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        orderNumber: orderData.order_number.toString(),
        totalAmount: parseFloat(orderData.total_price),
        currency: orderData.currency || "EUR",
        status: mapFinancialStatusToOrderStatus(orderData.financial_status),
        createdAt: orderData.created_at ? new Date(orderData.created_at) : new Date(),
      },
    });

    // Update customer stats
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        numberOfOrders: { increment: 1 },
        amountSpent: { increment: parseFloat(orderData.total_price) },
      },
    });

    console.log(`✅ Order ${order.orderNumber} saved for customer ${customer.email}`);

    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
