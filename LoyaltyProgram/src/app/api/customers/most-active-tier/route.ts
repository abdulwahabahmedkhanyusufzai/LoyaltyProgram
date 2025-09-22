// app/api/customers/most-active-tier/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // group customers by tier and count them
    const tiers = await prisma.customer.groupBy({
      by: ["loyaltyTitle"],
      _count: { loyaltyTitle: true },
    });

    if (!tiers.length) {
      return NextResponse.json({ mostActiveTier: null, count: 0 });
    }

    // find the tier with the highest count
    const mostActive = tiers.reduce((prev, curr) =>
      curr._count.loyaltyTitle > prev._count.loyaltyTitle ? curr : prev
    );

    return NextResponse.json({
      mostActiveTier: mostActive.loyaltyTitle,
      count: mostActive._count.loyaltyTitle,
    });
  } catch (error) {
    console.error("Error fetching most active tier:", error);
    return NextResponse.json(
      { error: "Failed to fetch most active tier" },
      { status: 500 }
    );
  }
}
