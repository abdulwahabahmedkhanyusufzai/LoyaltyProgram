import { fetchFromShopify } from "./fetchFromShopify";
import { CUSTOMER_LIST_QUERY } from "./GraphQLforCustomer";

type Customer = {
  id: string;
  // add other relevant fields as needed
};

export async function fetchAllCustomers(shop: string, token: string) {
  const allCustomers: Customer[] = [];
  let after: string | null = null;
  const PAGE_SIZE = 250;

  do {
    const data = await fetchFromShopify(shop, token, CUSTOMER_LIST_QUERY, {
      first: PAGE_SIZE,
      after,
    });

    const edges = data.customers.edges ?? [];
    allCustomers.push(...edges.map((e: any) => e.node));

    after = data.customers.pageInfo.hasNextPage
      ? data.customers.pageInfo.endCursor
      : null;
  } while (after);

  return allCustomers;
}