import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");
    const code = searchParams.get("code");

    if (!shop) return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
    if (!code) return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });

    if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
      return NextResponse.json({ error: "Invalid shop format" }, { status: 400 });
    }

    console.log("🛒 OAuth callback for:", shop);

    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.NEXT_SHOPIFY_API_KEY,
        client_secret: process.env.NEXT_SHOPIFY_API_SECRET,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error("Failed to fetch access token:", err);
      return NextResponse.json({ error: "Shopify access token error", details: err }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();
    const { access_token, scope } = tokenData;

    if (!access_token) {
      return NextResponse.json({ error: "No access token received" }, { status: 500 });
    }

    // Clean existing record (optional)
    await prisma.shop.deleteMany({});
    await prisma.shop.create({
      data: {
        shop,
        accessToken: access_token,
        scope,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Stored shop credentials for ${shop}`);

    // ----------------------------
    // 🧩 STEP 2: Register Webhook
    // ----------------------------
    const webhookMutation = `
      mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
          webhookSubscription {
            id
            topic
            format
            uri
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const webhookVariables = {
      topic: "ORDERS_CREATE",
      webhookSubscription: {
        uri: `${process.env.NEXT_PUBLIC_API_URL}/api/order-create`,
        format: "JSON",
      },
    };

    const webhookResponse = await fetch(`https://${shop}/admin/api/2025-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": access_token,
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: webhookMutation,
        variables: webhookVariables,
      }),
    });

    const webhookData = await webhookResponse.json();

    if (webhookData?.data?.webhookSubscriptionCreate?.userErrors?.length) {
      console.error("⚠️ Webhook user errors:", webhookData.data.webhookSubscriptionCreate.userErrors);
    } else {
      console.log("✅ Webhook registered:", webhookData.data.webhookSubscriptionCreate.webhookSubscription);
    }

    // ----------------------------
    // ✅ STEP 3: Redirect back to app
    // ----------------------------
    const appUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!appUrl) {
      console.error("APP_URL not set in environment");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const redirectUrl = new URL(`${appUrl}/`);
    redirectUrl.searchParams.set("shop", shop);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("❌ OAuth error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
