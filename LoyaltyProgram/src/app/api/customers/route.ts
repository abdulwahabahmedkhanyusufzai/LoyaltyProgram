// app/api/customers/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const API_VERSION = "2025-01";

const QUERY = `query GetCustomers($first: Int!, $after: String) {
  customers(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      cursor
      node {
        id
        firstName
        lastName
        email
        phone
        createdAt
        numberOfOrders
        amountSpent {
          amount
          currencyCode
        }
        tags
      }
    }
  }
}
`;

async function fetchCustomersFromShop(
  shop: string,
  token: string,
  first: number,
  after: string | null
) {
  const domain = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = `https://${domain}/admin/api/${API_VERSION}/graphql.json`;

  console.log("[Shopify] Fetching customers", {
    shopDomain: domain,
    first,
    after,
    tokenPreview: token?.slice(0, 6) + "...",
    apiUrl: url,
  });

  const body = JSON.stringify({ query: QUERY, variables: { first, after } });
  console.log("[Shopify] Request Body:", body);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body,
  });

  console.log("[Shopify] Response status:", response.status, response.statusText);

  let json;
  try {
    json = await response.json();
  } catch (err) {
    console.error("[Shopify] ❌ Failed to parse JSON:", err);
    throw new Error("Invalid JSON response from Shopify");
  }

  console.log("[Shopify] Raw JSON Response:", JSON.stringify(json, null, 2));

  if (json.errors) {
    console.error("[Shopify] ❌ GraphQL errors:", json.errors);
    throw new Error(JSON.stringify(json.errors));
  }

  if (!json.data?.customers) {
    console.warn("[Shopify] ⚠️ No 'customers' field returned:", json.data);
  }

  return json.data?.customers;
}

export async function GET(req: Request) {
  console.log("[API] ➡️ Incoming /api/customers request:", req.url);

  try {
    const { searchParams } = new URL(req.url);
    const shopId = Number(searchParams.get("shopId") ?? 2);
    const first = Number(searchParams.get("first") ?? 10);
    const after = searchParams.get("after");

    console.log("[API] Extracted query params", { shopId, first, after });

    // 🗄️ Get shop credentials
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { shop: true, accessToken: true },
    });

    if (!shop) {
      console.warn("[API] ❌ Shop not found for ID:", shopId);
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    console.log("[API] Shop credentials loaded", {
      shopDomain: shop.shop,
      tokenPreview: shop.accessToken?.slice(0, 6) + "...",
    });

    // 🌐 Fetch customers
    const customers = await fetchCustomersFromShop(
      shop.shop,
      shop.accessToken,
      first,
      after
    );

    console.log(
      "[API] ✅ Customers fetched",
      customers?.edges?.length ?? 0,
      "customers"
    );

    return NextResponse.json(customers, { status: 200 });
  } catch (err: any) {
    console.error("[API] ❌ Error fetching customers:", {
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json(
      { error: "Failed to fetch customers", details: err.message || String(err) },
      { status: 500 }
    );
  }
}
