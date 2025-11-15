import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    console.log(`[${requestId}] Fetching customers with at least 1 order…`);

    const customers = await prisma.customer.findMany({
      where: { numberOfOrders: { gt: 0 } },
      include: {
        orders: { orderBy: { createdAt: "desc" }, take: 1, include: { items: true } },
        pointsLedger: { orderBy: { earnedAt: "desc" }, take: 1 },
      },
    });

    const response = customers.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      loyaltyTitle: c.loyaltyTitle,
      numberOfOrders: c.numberOfOrders,
      amountSpent: Number(c.amountSpent),
      lastOrder: c.orders?.[0] || null,
      lastPointsEntry: c.pointsLedger?.[0] || null,
    }));

    console.log(`[${requestId}] Success | ${response.length} customers fetched`);

    return NextResponse.json({ requestId, totalCustomers: response.length, customers: response }, { status: 200 });
  } catch (error: any) {
    console.error(`[${requestId}] ERROR:`, error.message);
    return NextResponse.json({ requestId, error: "Failed to fetch customers", details: error.message }, { status: 500 });
  }
}
