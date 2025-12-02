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

export async function fetchProductImage(productId: string): Promise<string | null> {
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

  // Ensure ID is in GID format if it's just a number
  const gid = productId.startsWith("gid://") ? productId : `gid://shopify/Product/${productId}`;
  
  const productData = await shopifyQuery(productQuery, { productId: gid });
  const imageUrl = productData?.product?.media?.nodes?.[0]?.image?.url;

  return imageUrl || null;
}

export async function syncCustomerMetafields(shopifyCustomerId: string, points: number, tier: string) {
  const gid = shopifyCustomerId.startsWith("gid://") ? shopifyCustomerId : `gid://shopify/Customer/${shopifyCustomerId}`;
  
  const query = `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id key namespace value }
        userErrors { field message }
      }
    }
  `;

  const variables = {
    metafields: [
      {
        ownerId: gid,
        namespace: "loyalty",
        key: "points",
        type: "number_integer",
        value: points.toString(),
      },
      {
        ownerId: gid,
        namespace: "loyalty",
        key: "tier",
        type: "single_line_text_field",
        value: tier,
      },
    ],
  };

  const result = await shopifyQuery(query, variables);
  if (result?.metafieldsSet?.userErrors?.length > 0) {
    console.error("Metafield Sync Errors:", result.metafieldsSet.userErrors);
  } else {
    console.log(`Synced metafields for ${gid}: Points=${points}, Tier=${tier}`);
  }
}

export async function syncOrderMetafields(shopifyOrderId: string, pointsEarned: number) {
  // Ensure ID is in GID format
  // shopifyOrderId usually comes as "gid://shopify/Order/..." from DB, but let's be safe
  const gid = shopifyOrderId.startsWith("gid://") ? shopifyOrderId : `gid://shopify/Order/${shopifyOrderId}`;
  
  const query = `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id key namespace value }
        userErrors { field message }
      }
    }
  `;

  const variables = {
    metafields: [
      {
        ownerId: gid,
        namespace: "loyalty",
        key: "points",
        type: "number_integer",
        value: pointsEarned.toString(),
      },
    ],
  };

  const result = await shopifyQuery(query, variables);
  if (result?.metafieldsSet?.userErrors?.length > 0) {
    console.error("Order Metafield Sync Errors:", result.metafieldsSet.userErrors);
  } else {
    console.log(`Synced order metafields for ${gid}: Points=${pointsEarned}`);
  }
}

export async function createDiscountCode(value: number, prefix: string = "REWARD"): Promise<string | null> {
  const shopData = await getShopCredentials();
  if (!shopData) return null;

  const { shop, accessToken } = shopData;
  const code = `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  try {
    // 1. Create Price Rule
    const priceRuleRes = await fetch(`https://${shop}/admin/api/2024-10/price_rules.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        price_rule: {
          title: `Loyalty Reward $${value} Off`,
          target_type: "line_item",
          target_selection: "all",
          allocation_method: "across",
          value_type: "fixed_amount",
          value: `-${value}.00`,
          customer_selection: "all",
          starts_at: new Date().toISOString(),
        }
      }),
    });

    const priceRuleJson = await priceRuleRes.json();
    if (priceRuleJson.errors) {
      console.error("Price Rule Error:", priceRuleJson.errors);
      return null;
    }

    const priceRuleId = priceRuleJson.price_rule.id;

    // 2. Create Discount Code
    const discountRes = await fetch(`https://${shop}/admin/api/2024-10/price_rules/${priceRuleId}/discount_codes.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        discount_code: {
          code: code
        }
      }),
    });

    const discountJson = await discountRes.json();
    if (discountJson.errors) {
      console.error("Discount Code Error:", discountJson.errors);
      return null;
    }

    return code;

  } catch (err) {
    console.error("Failed to create discount code:", err);
    return null;
  }
}
