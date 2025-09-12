import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const API_VERSION = "2025-01"; // ✅ use a real version (not 2025-07)

const QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        cursor
        node {
          id
          title
          handle
          vendor
          productType
          tags
          createdAt
          updatedAt
variants(first: 5) {
  edges { node { id title sku price } }
}
          images(first: 3) {
            edges { node { id url altText } }
          }
        }
      }
    }
  }
`;

async function fetchProductsFromShop(
  shop: string,
  token: string,
  first: number,
  after: string | null
) {
  const domain = shop.replace(/^https?:\/\//, "").replace(/\/$/, ""); // normalize
  const url = `https://${domain}/admin/api/${API_VERSION}/graphql.json`;

  console.log("[Shopify] Fetching products:", {
    url,
    first,
    after,
    tokenPreview: token?.slice(0, 6) + "...",
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query: QUERY, variables: { first, after } }),
  });

  console.log("[Shopify] Response status:", response.status, response.statusText);

  let json;
  try {
    json = await response.json();
  } catch (err) {
    console.error("[Shopify] Failed to parse JSON:", err);
    throw new Error("Invalid JSON response from Shopify");
  }

  console.log("[Shopify] Raw response JSON:", JSON.stringify(json, null, 2));

  if (json.errors) {
    console.error("[Shopify] GraphQL errors:", json.errors);
    throw new Error(JSON.stringify(json.errors));
  }

  return json.data?.products;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = Number(searchParams.get("shopId") ?? 2);
    const first = Number(searchParams.get("first") ?? 10);
    const after = searchParams.get("after");

    console.log("[API] Incoming request", { shopId, first, after });

    // Fetch shop credentials from Prisma
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });

    if (!shop) {
      console.warn("[API] Shop not found for ID:", shopId);
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    console.log("[API] Shop credentials:", {
      id: shop.id,
      domain: shop.shop,
      tokenPreview: shop.accessToken?.slice(0, 6) + "...",
    });

    const products = await fetchProductsFromShop(
      shop.shop,
      shop.accessToken,
      first,
      after
    );

    console.log("[API] Successfully fetched products count:", products?.edges?.length ?? 0);

    return NextResponse.json(products, { status: 200 });
  } catch (err: any) {
    console.error("[API] Shopify API error (catch block):", err);
    return NextResponse.json(
      { error: "Failed to fetch products", details: err.message || String(err) },
      { status: 500 }
    );
  }
}
