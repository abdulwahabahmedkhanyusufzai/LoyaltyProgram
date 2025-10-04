import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const API_VERSION = "2025-01";

// 🔹 Shopify GraphQL query: fetch orders with product + line items
const ORDER_QUERY = `
  query GetOrders($first: Int!, $after: String) {
    orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
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
                  featuredImage {
                    url
                    altText
                  }
                  variants(first: 5) {
                    edges {
                      node {
                        id
                        title
                        sku
                        price
                        inventoryQuantity
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
  }
`;

// 🔹 Helper: fetch orders from Shopify
async function fetchOrders(shop: string, token: string, first: number, after: string | null) {
  const domain = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = `https://${domain}/admin/api/${API_VERSION}/graphql.json`;

  console.log("🌍 [fetchOrders] Sending request:", { url, first, after });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query: ORDER_QUERY, variables: { first, after } }),
  });

  console.log("📡 [fetchOrders] Response status:", response.status, response.statusText);

  let json;
  try {
    json = await response.json();
  } catch (err) {
    console.error("❌ [fetchOrders] JSON parse error:", err);
    throw new Error("Failed to parse Shopify JSON response");
  }

  if (json.errors) {
    console.error("❌ [fetchOrders] GraphQL errors:", JSON.stringify(json.errors, null, 2));
    throw new Error("Shopify GraphQL errors");
  }

  if (!json.data?.orders) {
    console.error("⚠️ [fetchOrders] Missing 'orders' in response:", JSON.stringify(json, null, 2));
    throw new Error("No orders found in Shopify response");
  }

  console.log("✅ [fetchOrders] Orders fetched:", json.data.orders.edges.length);
  return json.data.orders;
}

// 🔹 API Route
export async function GET(req: Request) {
  console.log("🚀 [API] /api/top-products START");

  try {
    const { searchParams } = new URL(req.url);
    const shopId = Number(searchParams.get("shopId") ?? 2);
    const first = Number(searchParams.get("first") ?? 20);
    const after = searchParams.get("after");

    // Get shop credentials
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      console.warn("⚠️ [API] Shop not found:", shopId);
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // Fetch orders
    const orders = await fetchOrders(shop.shop, shop.accessToken, first, after);

    // 🔹 Aggregate: product counts + purchase dates
    const productCount: Record<string, { info: any; count: number; purchaseDates: string[] }> = {};

    orders.edges.forEach((order: any) => {
      const orderDate = order.node.createdAt;

      order.node.lineItems.edges.forEach((li: any) => {
        const product = li.node.product;
        if (!product) return;

        if (!productCount[product.id]) {
          productCount[product.id] = { info: product, count: 0, purchaseDates: [] };
        }

        // Count product sales
        productCount[product.id].count += li.node.quantity;

        // Track purchase date
        productCount[product.id].purchaseDates.push(orderDate);
      });
    });

    // 🔹 Build final product list
    const products = Object.entries(productCount)
      .map(([id, { info, count, purchaseDates }]) => ({
        ...info,
        count,
        purchaseDates, // array of timestamps like ["2025-09-29T11:25:00Z", ...]
      }))
      .sort((a, b) => b.count - a.count);

    console.log("🏆 [API] Products computed:", products.slice(0, 5));

    return NextResponse.json({ products }, { status: 200 });
  } catch (err: any) {
    console.error("❌ [API] Failed to fetch products:", err.message || err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
