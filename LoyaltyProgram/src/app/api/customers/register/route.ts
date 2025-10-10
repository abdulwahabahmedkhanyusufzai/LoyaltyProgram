import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Shopify GraphQL fetch helper
 */
async function shopifyFetch(
  shopDomain: string,
  accessToken: string,
  query: string,
  variables: any = {}
) {
  console.log("🛍️ [ShopifyFetch] Sending GraphQL Request...");
  const res = await fetch(`https://${shopDomain}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  console.log("📦 [Shopify Response]:", JSON.stringify(json, null, 2));
  return json;
}

/**
 * POST /api/customers/register
 */
export async function POST(req: Request) {
  try {
    console.log("📨 Incoming customer registration request...");
    const body = await req.json();
    console.log("🧾 Request body:", body);

    const { fullName, email, tier, numberOfOrders, amountSpent } = body;

    if (!fullName || !email) {
      console.error("⚠️ Missing required fields: fullName or email");
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      );
    }

    // Split full name
    const [firstName, ...rest] = fullName.trim().split(" ");
    const lastName = rest.join(" ") || "";

    // Check for duplicate
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      console.warn("⚠️ Customer with this email already exists:", email);
      return NextResponse.json(
        { error: "Customer already exists in database." },
        { status: 409 }
      );
    }

    // Fetch shop credentials
    const shop = await prisma.shop.findFirst();
    if (!shop) {
      console.error("❌ No shop found in database.");
      return NextResponse.json({ error: "Shop not found." }, { status: 400 });
    }

    // --- Shopify GraphQL mutation (CustomerInput)
    const mutation = `
      mutation createCustomer($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
            firstName
            lastName
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        email,
        firstName,
        lastName,
        tags: ["Loyalty Program"],
        note: `Loyalty tier: ${tier || "Welcomed"}`,
      },
    };

    console.log("🚀 Sending mutation to Shopify...");
    const response = await shopifyFetch(shop.shop, shop.accessToken, mutation, variables);

    // Handle API-level errors
    if (response.errors) {
      console.error("❌ Shopify top-level errors:", response.errors);
      return NextResponse.json(
        { error: "Shopify API error", details: response.errors },
        { status: 400 }
      );
    }

    const { customerCreate } = response.data || {};
    const userErrors = customerCreate?.userErrors || [];

    if (userErrors.length > 0) {
      console.error("⚠️ Shopify user errors:", userErrors);
      return NextResponse.json(
        { error: "Shopify user errors", details: userErrors },
        { status: 400 }
      );
    }

    const shopifyCustomer = customerCreate.customer;
    if (!shopifyCustomer?.id) {
      console.error("❌ Shopify customer ID missing in response");
      return NextResponse.json({ error: "Invalid Shopify response" }, { status: 400 });
    }

    console.log("✅ Shopify customer created:", shopifyCustomer);

    // --- Save to local database
    const newCustomer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        shopifyId: shopifyCustomer.id,
        numberOfOrders: numberOfOrders ? parseInt(numberOfOrders) : 0,
        amountSpent: amountSpent ? parseFloat(amountSpent) : 0,
        loyaltyTitle: tier || "Welcomed",
      },
    });

    console.log("💾 Local customer saved:", newCustomer);

    return NextResponse.json({
      success: true,
      message: "Customer created successfully.",
      customer: newCustomer,
    });
  } catch (err: any) {
    console.error("🔥 Fatal error in register route:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
