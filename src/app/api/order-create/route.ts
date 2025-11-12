import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  const secret = process.env.NEXT_SHOPIFY_API_SECRET; // must match your app’s webhook secret
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");

  const body = await req.text(); // use text() here to verify HMAC properly
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  if (hash !== hmacHeader) {
    console.warn("⚠️ Webhook verification failed!");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const orderData = JSON.parse(body);

  console.log("✅ Shopify Order Webhook Received:");
  console.log("Order ID:", orderData.id);
  console.log("Total Price:", orderData.total_price);
  console.log("Customer Email:", orderData.customer?.email);

  // Trigger background job or queue here
  // triggerOrderAutomation(orderData);

  return NextResponse.json({ message: "Webhook received successfully" }, { status: 200 });
}
