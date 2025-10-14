import { fetchFromShopify } from "./fetchFromShopify";
import { CUSTOMER_ORDERS_QUERY } from "./GraphQLforCustomer";

export async function fetchCustomerMetrics(shop: string, token: string, customerId: string) {
  let ordersCount = 0;
  let totalAmountCents = 0;
  let after: string | null = null;
  const PAGE_SIZE = 250;

  do {
    const data = await fetchFromShopify(shop, token, CUSTOMER_ORDERS_QUERY, {
      customerId,
      first: PAGE_SIZE,
      after,
    });

    const orders = data.customer?.orders?.edges ?? [];
    if (orders.length === 0) break;

    ordersCount += orders.length;

    for (const order of orders) {
      const amount = order.node.totalPriceSet?.shopMoney?.amount;
      if (amount) totalAmountCents += Math.round(parseFloat(amount) * 100);
    }

    after = data.customer.orders.pageInfo.hasNextPage
      ? data.customer.orders.pageInfo.endCursor
      : null;
  } while (after);

  return { ordersCount, totalAmountCents };
}