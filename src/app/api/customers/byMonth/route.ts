// File: /src/app/api/customers-last-order/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Important for debugging / always fresh

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  console.log(`\n====================================================`);
  console.log(`📌 [${requestId}] Incoming GET /customers-last-order`);
  console.log(`====================================================`);

  try {
    console.log(`🔍 [${requestId}] Fetching customers with at least 1 order…`);

    const customers = await prisma.customer.findMany({
      where: {
        numberOfOrders: { gt: 0 },
      },
      include: {
        orders: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            items: true,
          },
        },
        pointsLedger: {
          orderBy: { earnedAt: "desc" },
          take: 1,
        },
      },
    });

    console.log(
      `✅ [${requestId}] Prisma returned ${customers.length} customers`
    );

    const response = customers.map((customer) => {
      console.log(
        `🧩 [${requestId}] Formatting customer ${customer.email} | Orders: ${customer.numberOfOrders}`
      );

      return {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        loyaltyTitle: customer.loyaltyTitle,
        numberOfOrders: customer.numberOfOrders,
        amountSpent: Number(customer.amountSpent),
        lastOrder: customer.orders?.[0] || null,
        lastPointsEntry: customer.pointsLedger?.[0] || null,
      };
    });

    console.log(
      `🎉 [${requestId}] Success | Total time: ${
        Date.now() - startTime
      }ms`
    );

    return NextResponse.json(
      {
        requestId,
        totalCustomers: response.length,
        customers: response,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`❌ [${requestId}] ERROR in customers-last-order`);
    console.error(`❌ Message: ${error.message}`);
    console.error(`❌ Stack: ${error.stack}`);

    return NextResponse.json(
      {
        requestId,
        error: "Failed to fetch customers",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
      console.log(`🔌 [${requestId}] Prisma disconnected safely`);
    } catch (disconnectError) {
      console.error(
        `⚠️ [${requestId}] Prisma disconnect error:`,
        disconnectError
      );
    }
  }
}
