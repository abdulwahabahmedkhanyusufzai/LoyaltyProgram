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
        const ledgerEntries = await prisma.pointsLedger.findMany({
          where: {
            earnedAt: {
              gte: week.start,
              lte: week.end,
            },
          },
          select: {
            change: true,
          },
        });

        let issued = 0;
        let redeemed = 0;

        ledgerEntries.forEach((entry) => {
          if (entry.change > 0) {
            issued += entry.change;
          } else {
            redeemed += Math.abs(entry.change);
          }
        });

        return {
          week: week.label,
          issued,
          redeemed,
        };
      })
    );

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Error fetching points history:", error);
    return NextResponse.json(
      { error: "Failed to fetch points history" },
      { status: 500 }
    );
  }
}
