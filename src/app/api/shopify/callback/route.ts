import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const log = (...args: any[]) => console.log(new Date().toISOString(), ...args);

  try {
    log("🚀 OAuth callback started");

    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");
    const code = searchParams.get("code");

    if (!shop) return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
    if (!code) return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });

    if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
      return NextResponse.json({ error: "Invalid shop format" }, { status: 400 });
    }

    log("🛒 Processing OAuth for shop:", shop);

    // Step 1: Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.NEXT_SHOPIFY_API_KEY,
        client_secret: process.env.NEXT_SHOPIFY_API_SECRET,
        code,
      }),
    });

    const tokenText = await tokenResponse.text();
    if (!tokenResponse.ok) {
      log("❌ Token fetch failed:", tokenText);
      return NextResponse.json({ error: "Shopify access token error", details: tokenText }, { status: 500 });
    }

    const tokenData = JSON.parse(tokenText);
    const { access_token, scope } = tokenData;

    if (!access_token) {
      log("❌ No access token received:", tokenData);
      return NextResponse.json({ error: "No access token received", details: tokenData }, { status: 500 });
    }

    log("✅ Access token received. Scope:", scope);

    // Step 2: Store/update shop in DB
    const shopRecord = await prisma.shop.upsert({
      where: { shop },
      update: { accessToken: access_token, scope, updatedAt: new Date() },
      create: { shop, accessToken: access_token, scope, createdAt: new Date(), updatedAt: new Date() },
    });

    log("✅ Shop record upserted in DB:", shopRecord);

    // Step 3: Register webhook
    const webhookMutation = `
      mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
          webhookSubscription { id topic uri filter }
          userErrors { field message }
        }
      }
    `;

    const webhookVariables = {
      topic: "ORDERS_CREATE",
      webhookSubscription: {
        uri: `${process.env.NEXT_PUBLIC_API_URL}/api/order-create`,
      },
    };

    const webhookResponse = await fetch(`https://${shop}/admin/api/2025-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": access_token,
        Accept: "application/json",
      },
      body: JSON.stringify({ query: webhookMutation, variables: webhookVariables }),
    });

    const webhookData = await webhookResponse.json();
    log("📦 Webhook response:", JSON.stringify(webhookData, null, 2));

    const userErrors = webhookData?.data?.webhookSubscriptionCreate?.userErrors || [];
    const webhookInfo = webhookData?.data?.webhookSubscriptionCreate?.webhookSubscription;

    if (userErrors.length > 0) log("⚠️ Webhook user errors:", userErrors);
    else if (webhookInfo) log("✅ Webhook successfully registered:", webhookInfo);
    else log("⚠️ Unexpected webhook response structure:", webhookData);

    // Step 4: Redirect back to app
    const appUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!appUrl) {
      log("❌ NEXT_PUBLIC_API_URL not set");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const redirectUrl = new URL(`${appUrl}/`);
    redirectUrl.searchParams.set("shop", shop);
    log("➡️ Redirecting to app:", redirectUrl.toString());

    return NextResponse.redirect(redirectUrl.toString());

  } catch (error: any) {
    log("❌ OAuth exception:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  } finally {
    log("🧹 Disconnecting Prisma client");
    await prisma.$disconnect();
  }
}
