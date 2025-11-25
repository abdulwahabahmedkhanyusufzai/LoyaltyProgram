import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

interface MonthFilterBody {
  year: number;
  month: number; // 1-12
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  console.log(`[${requestId}] POST /customers-by-month triggered`);

  try {
    const body: MonthFilterBody = await req.json();
    const { year, month } = body;

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        { requestId, error: "Invalid year or month" },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Filtering customers for ${year}-${month.toString().padStart(2, "0")}`);

    // Compute month range
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1)); // next month start

    console.log(`[${requestId}] Month range: ${startDate.toISOString()} - ${endDate.toISOString()}`);

    const customers = await prisma.customer.findMany({
      where: {
        orders: {
          some: {
            createdAt: {
              gte: startDate,
              lt: endDate,
            },
          },
        },
      },
      include: {
        orders: {
          where: {
            createdAt: {
              gte: startDate,
              lt: endDate,
            },
          },
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
        return {
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          loyaltyTitle: c.loyaltyTitle,
          numberOfOrders: c.numberOfOrders,
          amountSpent: Number(c.amountSpent),
          lastOrder: c.orders?.[0] || null,
          lastPointsEntry: c.pointsLedger?.[0] || null,
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
      { requestId, error: "Failed to fetch customers", details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
