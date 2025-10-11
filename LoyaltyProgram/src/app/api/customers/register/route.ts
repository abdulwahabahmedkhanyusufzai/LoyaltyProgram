import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Helper: Shopify GraphQL API fetch
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

    const { fullName, email, tier, numberOfOrders, amountSpent, activationMail } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      );
    }

    // Split full name into first + last
    const [firstName, ...rest] = fullName.trim().split(" ");
    const lastName = rest.join(" ") || "";

    // Prevent duplicates
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Customer already exists in database." },
        { status: 409 }
      );
    }

    // Fetch shop credentials
    const shop = await prisma.shop.findFirst();
    if (!shop) {
      return NextResponse.json({ error: "Shop not found." }, { status: 400 });
    }

    // --- Shopify Mutation: Create customer ---
    const createCustomerMutation = `
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

    console.log("🚀 Creating customer in Shopify...");
    const response = await shopifyFetch(shop.shop, shop.accessToken, createCustomerMutation, variables);

    if (response.errors) {
      console.error("❌ Shopify API errors:", response.errors);
      return NextResponse.json({ error: "Shopify API error", details: response.errors }, { status: 400 });
    }

    const { customerCreate } = response.data || {};
    const userErrors = customerCreate?.userErrors || [];
    if (userErrors.length > 0) {
      return NextResponse.json({ error: "Shopify user errors", details: userErrors }, { status: 400 });
    }

    const shopifyCustomer = customerCreate.customer;
    if (!shopifyCustomer?.id) {
      return NextResponse.json({ error: "Invalid Shopify response" }, { status: 400 });
    }

    console.log("✅ Shopify customer created:", shopifyCustomer);

    // --- Save in local database ---
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

    // --- Optional: Send activation email ---
if (activationMail) {
  console.log("📧 Sending account activation email...");

  const activationMutation = `
    mutation CustomerSendAccountInviteEmail($customerId: ID!) {
      customerSendAccountInviteEmail(customerId: $customerId) {
        customer {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const activationVariables = {
    customerId: shopifyCustomer.id,
  };

  const activationResponse = await shopifyFetch(
    shop.shop,
    shop.accessToken,
    activationMutation,
    activationVariables
  );

  const userErrors =
    activationResponse.data?.customerSendAccountInviteEmail?.userErrors || [];

  if (userErrors.length > 0) {
    console.warn("⚠️ Activation email failed:", userErrors);
  } else {
    console.log("✅ Activation email sent successfully!");
  }
}


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
