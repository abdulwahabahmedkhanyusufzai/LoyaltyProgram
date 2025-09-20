const API_VERSION = "2025-01";
export async function fetchFromShopify(
  shop: string,
  token: string,
  query: string,
  variables: Record<string, any> = {}
) {
  const domain = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = `https://${domain}/admin/api/${API_VERSION}/graphql.json`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify API error: ${text}`);
  }

  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));

  return json.data;
}