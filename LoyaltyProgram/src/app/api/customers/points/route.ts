import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";


// GET /api/customers/points
export async function GET() {
  try {
    // Fetch all customers
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        pointsLedger: {
          orderBy: { earnedAt: "desc" },
          take: 1, // only latest entry
          select: { balanceAfter: true },
        },
      },
    });

    // Format response
    const result = customers.map((c) => ({
      id: c.id,
      loyaltyPoints: c.pointsLedger[0]?.balanceAfter ?? 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching customers with points:", error);
    return NextResponse.json(
      { error: "Failed to fetch loyalty points" },
      { status: 500 }
    );
  }
}
