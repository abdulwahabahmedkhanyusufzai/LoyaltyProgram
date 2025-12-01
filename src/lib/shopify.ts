import { prisma } from "./prisma";

async function getShopCredentials() {
  const shop = await prisma.shop.findFirst();
  return shop;
}

async function shopifyQuery(query: string, variables: any = {}) {
  const shopData = await getShopCredentials();
  
  if (!shopData) {
    console.warn("⚠️ No shop found in database.");
    return null;
  }

  const { shop, accessToken } = shopData;

  try {
    const response = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json();
    if (json.errors) {
      console.error("Shopify GraphQL Errors:", JSON.stringify(json.errors, null, 2));
      return null;
    }
    return json.data;
  } catch (error) {
    console.error("Shopify API Error:", error);
    return null;
  }
}

export async function fetchOrderProductImage(orderName: string): Promise<string | null> {
  // Helper to fetch order by query
  const fetchOrderByQuery = async (query: string) => {
    const orderQuery = `
      query($query: String!) {
        orders(first: 1, query: $query) {
          edges {
            node {
              id
              lineItems(first: 1) {
                edges {
                  node {
                    product {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    return await shopifyQuery(orderQuery, { query });
  };

  // 1. Try fetching with the provided name (e.g. "#1035")
  let orderData = await fetchOrderByQuery(`name:${orderName}`);
  let productId = orderData?.orders?.edges?.[0]?.node?.lineItems?.edges?.[0]?.node?.product?.id;

  // 2. If not found and name starts with #, try without # (e.g. "1035")
  if (!productId && orderName.startsWith("#")) {
    const cleanName = orderName.substring(1);
    console.log(`Retrying fetch for order ${cleanName} (without #)...`);
    orderData = await fetchOrderByQuery(`name:${cleanName}`);
    productId = orderData?.orders?.edges?.[0]?.node?.lineItems?.edges?.[0]?.node?.product?.id;
  }

  // 3. If not found and name doesn't start with #, try with # (e.g. "#1035")
  if (!productId && !orderName.startsWith("#")) {
    const hashName = `#${orderName}`;
    console.log(`Retrying fetch for order ${hashName} (with #)...`);
    orderData = await fetchOrderByQuery(`name:${hashName}`);
    productId = orderData?.orders?.edges?.[0]?.node?.lineItems?.edges?.[0]?.node?.product?.id;
  }

  if (!productId) {
    console.log(`No product ID found for order ${orderName} (or variations)`);
    if (orderData) {
       console.log("Last Order Data:", JSON.stringify(orderData, null, 2));
    }
    return null;
  }

  // 4. Fetch product image
  const productQuery = `
    query ProductImageList($productId: ID!) {
      product(id: $productId) {
        media(first: 1, query: "media_type:IMAGE", sortKey: POSITION) {
          nodes {
            ... on MediaImage {
              image {
                url
              }
            }
          }
        }
      }
    }
  `;

  const productData = await shopifyQuery(productQuery, { productId });
  const imageUrl = productData?.product?.media?.nodes?.[0]?.image?.url;

  return imageUrl || null;
}
