import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  console.log(`[${requestId}] GET /customers triggered`);

  try {
    console.log(`[${requestId}] Starting Prisma query for customers with orders > 0`);

    const customers = await prisma.customer.findMany({
      where: { numberOfOrders: { gt: 0 } },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { items: true },
        },
        pointsLedger: {
          orderBy: { earnedAt: "desc" },
          take: 1,
        },
      },
    });

    console.log(`[${requestId}] Prisma query completed | ${customers.length} customers retrieved`);

    const response = customers.map((c, index) => {
      try {
        const lastOrder = c.orders?.[0] || null;
        const lastPointsEntry = c.pointsLedger?.[0] || null;

        return {
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          loyaltyTitle: c.loyaltyTitle,
          numberOfOrders: c.numberOfOrders,
          amountSpent: Number(c.amountSpent),
          lastOrder,
          lastPointsEntry,
        };
      } catch (mapError: any) {
        console.error(`[${requestId}] ERROR mapping customer at index ${index}:`, mapError);
        return { id: c.id, error: "Failed to map customer" };
      }
    });

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Response ready | ${response.length} customers | took ${duration}ms`);

    return NextResponse.json(
      { requestId, totalCustomers: response.length, customers: response },
      { status: 200 }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] FATAL ERROR after ${duration}ms:`, error);
    return NextResponse.json(
      {
        requestId,
        error: "Failed to fetch customers",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
