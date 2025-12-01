import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    // Group customers by loyaltyTitle
    const distribution = await prisma.customer.groupBy({
      by: ["loyaltyTitle"],
      _count: {
        loyaltyTitle: true,
      },
    });

    // Format for chart: [{ name: "Bronze", value: 10 }]
    // Note: The chart expects 'name' and 'rate' (percentage) or value?
    // The current chart implementation in mostActiveTier.tsx expects 'rate' (0-100) or value?
    // It seems to highlight ONE tier as 100% and others 0.
    // We should probably change it to show the actual distribution or count.
    // For now, let's return the raw counts, and we'll adjust the frontend component to display them.
    
    const chartData = distribution.map((item) => ({
      name: item.loyaltyTitle,
      value: item._count.loyaltyTitle,
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Error fetching tier distribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch tier distribution" },
      { status: 500 }
    );
  }
}
