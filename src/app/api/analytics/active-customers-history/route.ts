import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { subWeeks, startOfWeek, endOfWeek, format } from "date-fns";

export async function GET() {
  try {
    const today = new Date();
    const weeks = [];

    // Generate last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const date = subWeeks(today, i);
      const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
      const end = endOfWeek(date, { weekStartsOn: 1 });
      weeks.push({ start, end, label: `Week ${4 - i}` });
    }

    const chartData = await Promise.all(
      weeks.map(async (week) => {
        // Find unique customers who placed an order
        const activeOrderCustomers = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: week.start,
              lte: week.end,
            },
          },
          select: {
            customerId: true,
          },
          distinct: ["customerId"],
        });

        // Find unique customers who had points activity
        const activePointsCustomers = await prisma.pointsLedger.findMany({
          where: {
            earnedAt: {
              gte: week.start,
              lte: week.end,
            },
          },
          select: {
            customerId: true,
          },
          distinct: ["customerId"],
        });

        // Merge unique IDs
        const uniqueCustomerIds = new Set([
          ...activeOrderCustomers.map((o) => o.customerId),
          ...activePointsCustomers.map((p) => p.customerId),
        ]);

        return {
          date: week.label,
          customers: uniqueCustomerIds.size,
        };
      })
    );

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Error fetching active customers history:", error);
    return NextResponse.json(
      { error: "Failed to fetch active customers history" },
      { status: 500 }
    );
  }
}
