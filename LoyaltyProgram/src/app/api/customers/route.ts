import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { fetchProcessUpsertCustomers } from "./services/fetchProcessUpsertCustomers";
import { fetchCustomersFromDB } from "./services/fetchCustomersfromDB";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = Number(searchParams.get("shopId") ?? 4);

    if (isNaN(shopId) || shopId <= 0) {
      return NextResponse.json({ error: "Invalid shopId" }, { status: 400 });
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { shop: true, accessToken: true },
    });
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // Process new customers (Shopify sync)
    const processed = await fetchProcessUpsertCustomers(
      shop.shop,
      shop.accessToken
    );
    console.log(`[API] Processed ${processed.length} customers for shop ${shop.shop}`);

    // Fetch customers from DB
    const customers = await fetchCustomersFromDB();

    // ✅ Sort by ordersCount descending
    const sortedCustomers = customers.sort(
      (a: any, b: any) => (b.ordersCount ?? 0) - (a.ordersCount ?? 0)
    );

    return NextResponse.json({
      customers: sortedCustomers,
      count: sortedCustomers.length,
    });
  } catch (err: any) {
    console.error("[API] Error during sync:", err);
    return NextResponse.json(
      { error: "Failed to fetch or save customers", details: err.message },
      { status: 500 }
    );
  }
}
