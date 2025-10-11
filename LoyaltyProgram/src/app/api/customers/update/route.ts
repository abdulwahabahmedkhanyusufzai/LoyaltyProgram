import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Shopify Admin API Helper
 */
async function shopifyFetch(shopDomain, accessToken, query, variables = {}) {
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
 * Body: { email, firstName, lastName, tier, points, expiry }
 */
export async function POST(req) {
  try {
    console.log("🧾 Incoming request → /api/customers/register");
    const body = await req.json();
    console.log("📨 Request body:", body);

    const { email, firstName, lastName, tier, points, expiry } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Fetch shop credentials
    const shop = await prisma.shop.findFirst();
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 400 });
    }

    // Step 1️⃣ — Find existing local customer
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer not found in database" },
        { status: 404 }
      );
    }

    const customerId = existingCustomer.shopifyId;

    // Step 2️⃣ — Update customer in Shopify
    const updateMutation = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            email
            firstName
            lastName
            tags
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
        id: customerId,
        email,
        firstName,
        lastName,
        tags: [
          `Tier:${tier || existingCustomer.loyaltyTitle}`,
          `Points:${points || 0}`,
          `Expiry:${expiry || "N/A"}`,
        ],
      },
    };

    console.log("🚀 Updating customer on Shopify:", variables);
    const shopifyResponse = await shopifyFetch(
      shop.shop,
      shop.accessToken,
      updateMutation,
      variables
    );

    if (shopifyResponse.errors) {
      console.error("❌ Shopify GraphQL Errors:", shopifyResponse.errors);
      return NextResponse.json(
        { error: "Shopify API error", details: shopifyResponse.errors },
        { status: 400 }
      );
    }

    const userErrors = shopifyResponse?.data?.customerUpdate?.userErrors || [];
    if (userErrors.length > 0) {
      console.warn("⚠️ Shopify user errors:", userErrors);
      return NextResponse.json(
        { error: "Shopify user errors", details: userErrors },
        { status: 400 }
      );
    }

    // Step 3️⃣ — Send activation email
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

    console.log("📧 Sending account activation email...");
    const activationResponse = await shopifyFetch(
      shop.shop,
      shop.accessToken,
      activationMutation,
      { customerId }
    );

    if (activationResponse.errors) {
      console.error("❌ Activation email failed:", activationResponse.errors);
    } else if (
      activationResponse?.data?.customerSendAccountInviteEmail?.userErrors
        ?.length
    ) {
      console.warn(
        "⚠️ Activation email user errors:",
        activationResponse.data.customerSendAccountInviteEmail.userErrors
      );
    } else {
      console.log("✅ Activation email sent successfully!");
    }

    // Step 4️⃣ — Update local DB
    const updatedCustomer = await prisma.customer.update({
      where: { email },
      data: {
        firstName,
        lastName,
        loyaltyTitle: tier || existingCustomer.loyaltyTitle,
        updatedAt: new Date(),
      },
    });

    console.log("💾 Local DB customer updated:", updatedCustomer);

    // Step 5️⃣ — Optional: Update Points Ledger if provided
    if (points !== undefined) {
      await prisma.pointsLedger.create({
        data: {
          customerId: updatedCustomer.id,
          change: parseInt(points),
          balanceAfter: parseInt(points),
          reason: "manual update",
        },
      });
      console.log("⭐ Points ledger updated for customer:", updatedCustomer.email);
    }

    return NextResponse.json({
      success: true,
      message:
        "Customer updated successfully and activation email sent.",
      customer: updatedCustomer,
    });
  } catch (err) {
    console.error("🔥 Error in /api/customers/register:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
