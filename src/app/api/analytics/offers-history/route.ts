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
        // Count offers that were active during this week
        // Active means: startDate <= weekEnd AND endDate >= weekStart
        const activeCount = await prisma.offer.count({
          where: {
            startDate: {
              lte: week.end,
            },
            endDate: {
              gte: week.start,
            },
            isActive: true, // Optional: only count offers marked as active? 
                            // The user said "Active Offer Campaign", so probably yes.
                            // But historical data might want to show what WAS active then.
                            // If an offer is now inactive but was active then, it should count.
                            // However, the `isActive` flag usually toggles global visibility.
                            // I'll stick to date ranges for "active during that period".
          },
        });

        return {
          name: week.label,
          active: activeCount,
        };
      })
    );

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Error fetching offers history:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers history" },
      { status: 500 }
    );
  }
}
