import crypto from "crypto";
import { NextResponse } from "next/server";

// Optional: enable verbose debugging
const VERBOSE_DEBUG = process.env.DEBUG_SHOPIFY_WEBHOOK === "true";

interface ShopifyOrder {
  id: number | string;
  total_price: string;
  customer?: {
    email?: string;
  };
  [key: string]: any; // fallback for extra fields
}

export async function POST(req: Request): Promise<Response> {
   console.log("Webhook trigger");
    try {
    const secret = process.env.NEXT_SHOPIFY_API_SECRET;
    if (!secret) {
      console.error("❌ Missing NEXT_SHOPIFY_API_SECRET in environment variables");
      return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
    }

    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    if (!hmacHeader) {
      console.warn("⚠️ Missing HMAC header");
      if (VERBOSE_DEBUG) console.log("Request headers:", Object.fromEntries(req.headers.entries()));
      return NextResponse.json({ message: "Missing HMAC header" }, { status: 400 });
    }

    const body = await req.text();
    if (VERBOSE_DEBUG) console.log("Raw webhook body:", body);

    // Compute HMAC for verification
    const hash = crypto.createHmac("sha256", secret).update(body, "utf8").digest("base64");
    const hashBuffer = Buffer.from(hash, "base64");
    const hmacBuffer = Buffer.from(hmacHeader, "base64");
    const valid = hashBuffer.length === hmacBuffer.length && crypto.timingSafeEqual(hashBuffer, hmacBuffer);

    if (!valid) {
      console.warn("⚠️ Webhook verification failed!");
      if (VERBOSE_DEBUG) {
        console.log("Computed HMAC:", hash);
        console.log("Received HMAC:", hmacHeader);
      }
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orderData: ShopifyOrder = JSON.parse(body);

    console.log("✅ Shopify Order Webhook Verified:");
    console.log("Order ID:", orderData.id);
    console.log("Total Price:", orderData.total_price);
    console.log("Customer Email:", orderData.customer?.email);

    if (VERBOSE_DEBUG) {
      console.log("Full order payload:", JSON.stringify(orderData, null, 2));
    }

    // Trigger background tasks (non-blocking)
    // triggerOrderAutomation(orderData).catch(console.error);

    return NextResponse.json({ message: "Webhook received successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
