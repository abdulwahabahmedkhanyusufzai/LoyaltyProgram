import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    // ⚡ Query only once, ordered by count
    const topTier = await prisma.customer.groupBy({
      by: ["loyaltyTitle"],
      _count: { loyaltyTitle: true },
      orderBy: { _count: { loyaltyTitle: "desc" } }, // avoid reduce() in JS
      take: 1, // only top 1 result
    });

    if (!topTier.length) {
      return NextResponse.json({ mostActiveTier: null, count: 0 });
    }

    return NextResponse.json({
      mostActiveTier: topTier[0].loyaltyTitle,
      count: topTier[0]._count.loyaltyTitle,
    });
  } catch (error) {
    console.error("❌ Error fetching most active tier:", error);
    return NextResponse.json(
      { error: "Failed to fetch most active tier" },
      { status: 500 }
    );
  }
}
