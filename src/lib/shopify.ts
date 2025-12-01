const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
const SHOP = process.env.SHOPIFY_STORE_DOMAIN;

async function shopifyQuery(query: string, variables: any = {}) {
  if (!ADMIN_TOKEN || !SHOP) {
    console.warn("⚠️ Missing Shopify admin API credentials.");
    return null;
  }

  try {
    const response = await fetch(`https://${SHOP}/admin/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
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
  // 1. Fetch order to get the first product ID
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

  const orderData = await shopifyQuery(orderQuery, { query: `name:${orderName}` });
  
  const productId = orderData?.orders?.edges?.[0]?.node?.lineItems?.edges?.[0]?.node?.product?.id;

  if (!productId) {
    console.log(`No product ID found for order ${orderName}`);
    return null;
  }

  // 2. Fetch product image
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
