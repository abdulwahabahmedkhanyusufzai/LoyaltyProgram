import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";


export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    // Parse the incoming request URL
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");
    const code = searchParams.get("code");


    // Enhanced validation
    if (!shop) {
      console.error("Error: Missing shop parameter");
      return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
    }

    if (!code) {
      console.error("Error: Missing code parameter");
      return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
    }

    // Validate shop format
    if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
      console.error("Error: Invalid shop format");
      return NextResponse.json({ error: "Invalid shop format" }, { status: 400 });
    }

    console.log("Received shop:", shop);
    console.log("Received code:", code);

    // Exchange the authorization code for an access token with better error handling
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_SHOPIFY_API_KEY,
        client_secret: process.env.NEXT_SHOPIFY_API_SECRET,
        code: code,
      }),
    });

    // Check for non-JSON responses
    const contentType = tokenResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Received non-JSON response:", await tokenResponse.text());
      return NextResponse.json(
        { error: "Invalid response from Shopify" },
        { status: 500 }
      );
    }

    // Handle unsuccessful responses
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Shopify API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch access token", details: errorData },
        { status: tokenResponse.status }
      );
    }

    // Parse the response
    const tokenData = await tokenResponse.json();
    const { access_token, scope } = tokenData;

    if (!access_token) {
      console.error("No access token in response:", tokenData);
      return NextResponse.json(
        { error: "No access token received" },
        { status: 500 }
      );
    }

    // Use Prisma with better error handling
    try {
      // Delete all old shops before creating a new one
      await prisma.shop.deleteMany({});
      console.log("Successfully deleted all old shop records.");
      
      // Create the new shop record
      await prisma.shop.create({
        data: {
          shop,
          accessToken: access_token,
          scope,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log(`Successfully created shop data for ${shop}`);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database operation failed" },
        { status: 500 }
      );
    }

    // Construct redirect URL with error handling
    const appUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!appUrl) {
      console.error("APP_URL environment variable not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/`);
    redirectUrl.searchParams.set("shop", shop);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Unhandled error during Shopify callback:", error);
    return NextResponse.json(
      { error: "Internal Server Error", },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error("Error disconnecting from database:", error);
    }
  }
}
