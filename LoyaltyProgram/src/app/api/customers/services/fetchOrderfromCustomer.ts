import { fetchFromShopify } from "./fetchFromShopify";
import { prisma } from "../../../../lib/prisma";

export async function fetchOrdersForAllCustomers(shop: string, token: string) {
  // 1. Get all customers from DB
  const customers = await prisma.customer.findMany({
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  console.info(`[sync] Found ${customers.length} local customers to fetch orders for.`);

  for (const customer of customers) {
    const prefix = `[sync:${customer.id}]`;
    console.info(`${prefix} Starting fetchOrdersForCustomerAndSave for shop=${shop}`);

    let allOrders: any[] = [];
    let after: string | null = null;
    let fetchPage = 0;

    do {
      fetchPage++;
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

      let data: any;
      try {
        data = await fetchFromShopify(shop, token, query, { id: customer.id, after });
      } catch (err: any) {
        console.error(`${prefix} fetchFromShopify ERROR on page ${fetchPage}:`, err?.message ?? err);
        break;
      }

      const edges = data.customer?.orders?.edges || [];
      const nodes = edges.map((e: any) => e.node);
      console.info(`${prefix} Received ${nodes.length} orders on page ${fetchPage}`);
      allOrders.push(...nodes);

      const pageInfo = data.customer?.orders?.pageInfo;
      after = pageInfo?.hasNextPage ? edges[edges.length - 1]?.cursor ?? null : null;
    } while (after);

    console.info(`${prefix} Finished fetching. Total orders fetched: ${allOrders.length}`);

    // --- Persist orders ---
    for (const order of allOrders) {
      if (!order.name) continue;

      const totalAmount = parseFloat(order.totalPriceSet?.shopMoney?.amount ?? "0");
      const currency = order.totalPriceSet?.shopMoney?.currencyCode ?? "EUR";

      try {
        await prisma.order.upsert({
          where: { orderNumber: order.name },
          update: {
            totalAmount,
            currency,
            updatedAt: new Date(),
          },
          create: {
            orderNumber: order.name,
            totalAmount,
            currency,
            createdAt: new Date(order.createdAt),
            customer: { connect: { id: customer.id } },
          },
        });
        console.info(`${prefix} Saved order ${order.name}`);
      } catch (err: any) {
        console.error(`${prefix} Error upserting order ${order.name}:`, err);
      }
    }
  }
}
