async function fetchOrdersForCustomer(shop: string, token: string, customerId: string) {
  let allOrders: any[] = [];
  let after: string | null = null;

  do {
    const query = `
      query Orders($id: ID!, $after: String) {
        customer(id: $id) {
          orders(first: 50, after: $after, sortKey: CREATED_AT, reverse: true) {
            edges {
              node {
                id
                name
                createdAt
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    const data = await fetchFromShopify(shop, token, query, { id: customerId, after });
    const edges = data.customer.orders.edges || [];
    allOrders.push(...edges.map((e: any) => e.node));

    const pageInfo = data.customer.orders.pageInfo;
    after = pageInfo.hasNextPage ? edges[edges.length - 1].cursor : null;
  } while (after);

  return allOrders;
}
