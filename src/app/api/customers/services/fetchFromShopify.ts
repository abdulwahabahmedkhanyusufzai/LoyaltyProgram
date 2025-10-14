const API_VERSION = "2025-01";

export async function fetchFromShopify(
  shop: string,
  token: string,
  query: string,
  variables: Record<string, any> = {},
  attempt: number = 0
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

  // pull rate limit headers
  const available = Number(res.headers.get("X-GraphQL-Available") ?? "1000");
  const cost = Number(res.headers.get("X-GraphQL-Cost-Incurred") ?? "0");
  const requested = Number(res.headers.get("X-GraphQL-Requested-Cost") ?? "0");

  // proactively wait if available bucket < requested
  if (available < requested) {
    const delay = Math.min(2000 * (attempt + 1), 10000); // exponential backoff
    console.warn(
      `[Shopify] Bucket low (${available}), waiting ${delay}ms before retry.`
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchFromShopify(shop, token, query, variables, attempt + 1);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify API error: ${text}`);
  }

  const json = await res.json();

  // if throttled → retry
  if (json.errors) {
    const throttled = json.errors.some(
      (e: any) => e.extensions?.code === "THROTTLED"
    );
    if (throttled) {
      const delay = Math.min(2000 * (attempt + 1), 10000);
      console.warn(
        `[Shopify] Throttled. Retrying in ${delay}ms (attempt ${attempt + 1})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchFromShopify(shop, token, query, variables, attempt + 1);
    }

    throw new Error(JSON.stringify(json.errors));
  }

  console.log(
    `[Shopify] Query cost=${cost}, available=${available}, requested=${requested}`
  );

  return json.data;
}
