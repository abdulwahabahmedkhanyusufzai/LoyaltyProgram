import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { fetchProcessUpsertCustomers } from "./services/fetchProcessUpsertCustomers";
import { fetchCustomersFromDB } from "./services/fetchCustomersfromDB";
import { fetchFromShopify } from "./services/fetchFromShopify";
import { CUSTOMER_ORDERS_QUERY } from "./services/GraphQLforCustomer";

export async function GET(req: Request) {
  try {
    // 🔹 Fetch the only shop from DB
    const shop = await prisma.shop.findFirst({
      select: { id: true, shop: true, accessToken: true },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // 🔹 Check for existing customers
    const existingCustomers = await prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        loyaltyTitle: true,
        numberOfOrders: true,
        amountSpent: true,
        shopifyId: true,
        orderId :true
      },
      orderBy: { numberOfOrders: "desc" },
    });

    if (existingCustomers.length > 0) {
      return NextResponse.json({
        customers: existingCustomers,
        count: existingCustomers.length,
      });
    }

    // 🔹 Sync customers from Shopify
    const processed = await fetchProcessUpsertCustomers(
      shop.shop,
      shop.accessToken
    );
    console.log(`[API] Processed ${processed.length} customers for shop ${shop.shop}`);

    const customers = await fetchCustomersFromDB();

    // 🔹 Sync orders for each customer
    for (const customer of customers) {
      let after: string | null = null;
      const PAGE_SIZE = 100;

      console.log(`[OrderSync] Starting sync for customer ${customer.id} (${customer.shopifyId})`);

      do {
        try {
          const data = await fetchFromShopify(
            shop.shop,
            shop.accessToken,
            CUSTOMER_ORDERS_QUERY,
            { customerId: customer.shopifyId, first: PAGE_SIZE, after }
          );

          if (!data.customer) {
            console.warn(`[OrderSync] No Shopify customer found for ${customer.shopifyId}`);
            break;
          }

          const orders = data.customer.orders.edges ?? [];
          if (orders.length === 0) {
            console.log(`[OrderSync] No orders found for customer ${customer.id}`);
            break;
          }

          for (const edge of orders) {
            const order = edge.node;
            const amount = parseFloat(order.totalPriceSet?.shopMoney?.amount ?? "0");
            const currency = order.totalPriceSet?.shopMoney?.currencyCode ?? "USD";

            await prisma.order.upsert({
              where: { orderNumber: order.name },
              update: { totalAmount: amount, currency, createdAt: new Date(order.createdAt) },
              create: {
                orderNumber: order.name,
                totalAmount: amount,
                currency,
                createdAt: new Date(order.createdAt),
                customer: {
                  connectOrCreate: {
                    where: { id: customer.id },
                    create: {
                      id: customer.id,
                      firstName: customer.firstName,
                      lastName: customer.lastName,
                      email: customer.email,
                      shopifyId: customer.shopifyId,
                    },
                  },
                },
                shop: { connect: { id: shop.id } },
              },
            });
          }

          after = data.customer.orders.pageInfo.hasNextPage
            ? data.customer.orders.pageInfo.endCursor
            : null;

        } catch (err) {
          console.error(`[OrderSync] Failed for customer ${customer.id}:`, err);
          break;
        }
      } while (after);

      console.log(`[OrderSync] Finished syncing orders for customer ${customer.id}`);
    }

    return NextResponse.json({ customers, count: customers.length });
  } catch (err: any) {
    console.error("[API] Error during sync:", err);
    return NextResponse.json(
      { error: "Failed to fetch or save customers", details: err.message },
      { status: 500 }
    );
  }
}
