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
  console.log(`[Shopify API] Fetching from URL: ${url}`);
  console.log(
    `[Shopify API] Requesting with variables:`,
    JSON.stringify(variables)
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[Shopify API] Fetch failed with status ${response.status}: ${errorText}`
    );
    throw new Error(`Shopify API error: ${errorText}`);
  }

  const json = await response.json();
  if (json.errors) {
    console.error(
      `[Shopify API] GraphQL errors:`,
      JSON.stringify(json.errors, null, 2)
    );
    throw new Error(JSON.stringify(json.errors));
  }
  console.log("[Shopify API] Fetch successful.");
  return json.data;
}

// 🔁 Fetch all pages of customers and flatten nodes
async function fetchAllCustomers(shop: string, token: string) {
  console.log("[Shopify API] Starting to fetch all customers...");
  let allCustomers: any[] = [];
  let after: string | null = null;
  const PAGE_SIZE = 250; // Shopify max per page

  do {
    console.log(
      `[Shopify API] Fetching next page, starting after cursor: ${after}`
    );
    const data = await fetchFromShopify(shop, token, CUSTOMER_LIST_QUERY, {
      first: PAGE_SIZE,
      after,
    });

    const edges = data.customers.edges ?? [];
    const nodes = edges.map((edge) => edge.node); // flatten nodes
    allCustomers.push(...nodes);

    console.log(
      `[Shopify API] Fetched ${nodes.length} customers, total so far: ${allCustomers.length}`
    );

    after = data.customers.pageInfo.hasNextPage
      ? data.customers.pageInfo.endCursor
      : null;
    console.log(
      `[Shopify API] Has next page: ${data.customers.pageInfo.hasNextPage}, new cursor: ${after}`
    );
  } while (after);

  console.log(
    `[Shopify API] Finished fetching all customers. Total fetched: ${allCustomers.length}`
  );
  return allCustomers;
}

export async function GET(req: Request) {
  console.log("[API Route] GET request received.");
  try {
    const { searchParams } = new URL(req.url);
    const shopId = Number(searchParams.get("shopId") ?? 4);
    console.log(`[API Route] Extracted shopId: ${shopId}`); // 🗄️ Get shop credentials

    console.log("[Database] Looking for shop credentials...");
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { shop: true, accessToken: true },
    });

    if (!shop) {
      console.error(`[Database] Shop with ID ${shopId} not found.`);
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }
    console.log(`[Database] Found shop: ${shop.shop}`); // 🌐 Fetch all customers + total count

    console.log(
      "[API Route] Starting concurrent fetch from Shopify for customers and count."
    );
    const [allCustomers, countData] = await Promise.all([
      fetchAllCustomers(shop.shop, shop.accessToken),
      fetchFromShopify(shop.shop, shop.accessToken, CUSTOMER_COUNT_QUERY),
    ]);
    console.log(
      `[API Route] Finished fetching. Total customers fetched: ${allCustomers.length}, Total count: ${countData.customersCount.count}`
    ); // 💾 Save/update all customers in the loyal_customers table using Prisma

    if (allCustomers.length > 0) {
      console.log(
        `[Database] Attempting to save ${allCustomers.length} customers to the database...`
      );
      const upsertPromises = allCustomers.map(async (customer: any) => {
        // Prepare data for Prisma
        const customerData = {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          numberOfOrders: Number(customer.numberOfOrders),
          amountSpent: parseFloat(customer.amountSpent?.amount || "0"), // Convert string to float for Decimal type
        }; // Use upsert to update if a customer with the same email exists, or create a new one.
        return prisma.customer.upsert({
          where: { email: customer.email },
          update: customerData,
          create: customerData,
        });
      });

      await Promise.all(upsertPromises);
      console.log(
        `[Database] Successfully saved/updated ${allCustomers.length} customers.`
      );
    } else {
      console.log("[Database] No customers to save to the database.");
    }
      const loyalCustomers = await prisma.customer.findMany();
    const loyalCustomersCount = await prisma.customer.count();
    console.log("[API Route] Request completed successfully.");
    return NextResponse.json(
      {
        customers: loyalCustomers, // flat array of customer objects
        count: loyalCustomersCount,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[API Route] An unexpected error occurred:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch or save customers",
        details: err.message || String(err),
      },
      { status: 500 }
    );
  }
}
