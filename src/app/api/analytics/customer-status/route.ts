import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { subDays } from "date-fns";

export async function GET() {
  try {
    const thirtyDaysAgo = subDays(new Date(), 30);

    // 1. Get total customers
    const totalCustomers = await prisma.customer.count();

    // 2. Get active customers (placed order OR earned/redeemed points in last 30 days)
    const activeOrderCustomers = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        customerId: true,
      },
      distinct: ["customerId"],
    });

    const activePointsCustomers = await prisma.pointsLedger.findMany({
      where: {
        earnedAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        customerId: true,
      },
      distinct: ["customerId"],
    });

    const uniqueActiveIds = new Set([
      ...activeOrderCustomers.map((o) => o.customerId),
      ...activePointsCustomers.map((p) => p.customerId),
    ]);

    const activeCount = uniqueActiveIds.size;
    const inactiveCount = Math.max(0, totalCustomers - activeCount);

    return NextResponse.json({
      active: activeCount,
      inactive: inactiveCount,
    });
  } catch (error) {
    console.error("Error fetching customer status:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer status" },
      { status: 500 }
    );
  }
}
