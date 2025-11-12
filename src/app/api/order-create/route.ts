import { NextResponse } from 'next/server';

// This function handles all POST requests sent to /api/order-create
export async function POST(req: Request) {
  try {
    // 1. Get the JSON payload from the request
    // This 'orderData' is the complete order object
    const orderData = await req.json();

    // 2. "Trace" the data by logging it to your server console
    // When a webhook fires, you'll see this in your terminal
    console.log('--- ✅ Shopify Webhook Received ---');
    console.log('Order ID:', orderData.id);
    console.log('Total Price:', orderData.total_price);
    console.log('Customer Email:', orderData.customer?.email);
    console.log('------------------------------------');

    // 3. Trigger your "cron job" or background logic here
    // IMPORTANT: Do NOT 'await' this if it's a long task!
    // (See the warning below)
    // For example:
    // triggerMyCronJob(orderData);
    

    // 4. Send a 200 OK response back to Shopify *immediately*
    // This tells Shopify you successfully received the webhook.
    return NextResponse.json({ message: "Webhook received successfully" }, { status: 200 });

  } catch (error) {
    // 5. If an error happens, log it and send a 500 status
    // Shopify will see the error and try to send the webhook again.
    console.error('Error handling webhook:', error);
    return NextResponse.json({ message: "Error handling webhook" }, { status: 500 });
  }
}