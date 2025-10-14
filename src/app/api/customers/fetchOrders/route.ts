import { PointsLedger } from './../../../../../node_modules/.prisma/client/index.d';
// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Fetch orders for this customer
    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        currency: true,
        createdAt: true,
        shopId: true,
      },
    });

    // Fetch loyalty point ledger separately
   const loyaltyLedger = await prisma.pointsLedger.findMany({
  where: { customerId: customer.id },
  orderBy: { earnedAt: "desc" },
  select: {
    id: true,
    reason: true,
    change: true,
    balanceAfter: true,
    sourceType: true,
    sourceId: true,
    earnedAt: true,
    expiresAt: true,
    orderId: true,
  },
});


    return NextResponse.json({
      customer,
      orders,
      loyaltyLedger,
      ordersCount: orders.length,
      ledgerCount: loyaltyLedger.length,
    });
  } catch (err: any) {
    console.error("[API] Error fetching orders or ledger by customerId:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders or ledger", details: err.message },
      { status: 500 }
    );
  }
}
