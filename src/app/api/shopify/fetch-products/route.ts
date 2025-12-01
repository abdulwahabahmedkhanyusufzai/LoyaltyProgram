import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const API_VERSION = "2025-01";

// Shopify GraphQL query (with pagination)
const ORDER_QUERY = `
  query GetOrders($first: Int!, $after: String) {
    orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: false) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          createdAt
          lineItems(first: 50) {
            edges {
              node {
                quantity
                product {
                  id
                  title
                  handle
                  productType
                  vendor
                  tags
                  status
                  onlineStoreUrl
                  featuredImage { url altText }
                  variants(first: 5) {
                    edges {
                      node { id title sku price inventoryQuantity }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchOrders(shop: string, token: string, first: number, after: string | null) {
  const domain = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = `https://${domain}/admin/api/${API_VERSION}/graphql.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query: ORDER_QUERY, variables: { first, after } }),
  });

  const json = await response.json();
  if (json.errors) throw new Error("Shopify GraphQL errors: " + JSON.stringify(json.errors));
  if (!json.data?.orders) throw new Error("No orders found in Shopify response");

  return json.data.orders;
}

export async function GET(req: Request) {
  try {
    // Get shop credentials from DB
    const shop = await prisma.shop.findFirst();
    if (!shop) return NextResponse.json({ error: "No shop found" }, { status: 404 });

    // Paginate through all orders
    let allOrders: any[] = [];
    let after: string | null = null;
    const PAGE_SIZE = 50; // adjust if needed

    do {
      const orders = await fetchOrders(shop.shop, shop.accessToken, PAGE_SIZE, after);
      allOrders.push(...orders.edges);
      after = orders.pageInfo.endCursor;
    } while (after);

    // Aggregate products
    const productCount: Record<string, { info: any; count: number; purchaseDates: string[] }> = {};

    allOrders.forEach((order) => {
      const orderDate = order.node.createdAt;
      order.node.lineItems.edges.forEach((li: any) => {
        const product = li.node.product;
        if (!product) return;

        if (!productCount[product.id]) {
          productCount[product.id] = { info: product, count: 0, purchaseDates: [] };
        }
        productCount[product.id].count += li.node.quantity;
        productCount[product.id].purchaseDates.push(orderDate);
      });
    });

    // Sort products by total quantity sold
    const products = Object.entries(productCount)
      .map(([id, { info, count, purchaseDates }]) => ({ ...info, count, purchaseDates }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ products, totalProducts: products.length }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
