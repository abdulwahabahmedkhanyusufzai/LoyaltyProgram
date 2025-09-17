// app/api/customers/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const API_VERSION = "2025-01";

const CUSTOMER_LIST_QUERY = `
  query getCustomers($first: Int!, $after: String) {
    customers(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          firstName
          lastName
          email
          numberOfOrders
          amountSpent {
            amount
            currencyCode
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const CUSTOMER_COUNT_QUERY = `
  query {
    customersCount {
      count
    }
  }
`;

async function fetchFromShopify(
  shop: string,
  token: string,
  query: string,
  variables: Record<string, any> = {}
) {
  const domain = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = `https://${domain}/admin/api/${API_VERSION}/graphql.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// 🔁 Fetch all pages of customers and flatten nodes
async function fetchAllCustomers(shop: string, token: string) {
  let allCustomers: any[] = [];
  let after: string | null = null;
  const PAGE_SIZE = 250; // Shopify max per page

  do {
    const data = await fetchFromShopify(shop, token, CUSTOMER_LIST_QUERY, {
      first: PAGE_SIZE,
      after,
    });

    const edges = data.customers.edges ?? [];
    const nodes = edges.map(edge => edge.node); // flatten nodes
    allCustomers.push(...nodes);

    console.log(`Fetched ${nodes.length} customers, total so far: ${allCustomers.length}`);

    after = data.customers.pageInfo.hasNextPage ? data.customers.pageInfo.endCursor : null;
  } while (after);

  return allCustomers;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = Number(searchParams.get("shopId") ?? 4);

    // 🗄️ Get shop credentials
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { shop: true, accessToken: true },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // 🌐 Fetch all customers + total count
    const [allCustomers, countData] = await Promise.all([
      fetchAllCustomers(shop.shop, shop.accessToken),
      fetchFromShopify(shop.shop, shop.accessToken, CUSTOMER_COUNT_QUERY),
    ]);

    return NextResponse.json(
      {
        customers: allCustomers, // flat array of customer objects
        count: countData.customersCount.count,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch customers", details: err.message || String(err) },
      { status: 500 }
    );
  }
}
