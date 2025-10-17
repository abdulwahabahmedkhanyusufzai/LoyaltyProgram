// File: /app/api/authenticate/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

// Explicitly mark the route as dynamic
export const dynamic = 'force-dynamic';  // This makes Next.js render it dynamically
const prisma = new PrismaClient();
export async function GET(req) {
  try {
    // Parse the incoming request URL and extract the 'shop' query parameter
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");

    // Ensure the 'shop' parameter is provided
    if (!shop) {
      console.warn("No shop param detected.Redirecting to storeCreation");
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}`);
    }else{
    const existingShop = await prisma.shop.findUnique({ where: { shop } });

    if (existingShop) {
      console.log("Shop already exists:",existingShop);
      return NextResponse.redirect(process.env.NEXT_PUBLIC_API_URL);
    }
    // Define the requested scopes and redirect URI
    const scopes = `read_orders,read_customers,write_customers,write_content,read_content,read_products,write_products,write_files,read_files,write_online_store_navigation,read_online_store_navigation,write_publications,read_publications,write_product_listings,read_product_listings`;
    const redirectUri = process.env.APP_URL_RRDIRECT;

    // Construct the install URL for Shopify OAuth authentication
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.NEXT_SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}`;
    console.log("Generated Install URL:", installUrl);

    // Redirect the user to the Shopify OAuth installation URL
    return NextResponse.redirect(installUrl);
    }
  } catch (error) {
    // Log any errors that occur during the authentication process
    console.error("Error during Shopify authentication:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
