import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

// Simple CORS helper
function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

// Handle preflight CORS requests
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  return cors(res);
}

// GET /api/customers/email/[email]
export async function GET(
  req: Request,
  { params }: { params: { email: string } }
) {
  const { email } = params;

  if (!email) {
    const res = NextResponse.json({ message: "Email is required" }, { status: 400 });
    return cors(res);
  }

  try {
    // Fetch customer by email
    const customer = await prisma.customer.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        pointsLedger: {
          orderBy: { earnedAt: "desc" },
          take: 1,
          select: { balanceAfter: true },
        },
      },
    });

    if (!customer) {
      const res = NextResponse.json({ message: "Customer not found" }, { status: 404 });
      return cors(res);
    }

    const result = {
      id: customer.id,
      name: `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim(),
      email: customer.email,
      loyaltyPoints: customer.pointsLedger[0]?.balanceAfter ?? 0,
    };

    const res = NextResponse.json(result, { status: 200 });
    return cors(res);
  } catch (error: any) {
    console.error("Error fetching customer by email:", error);
    const res = NextResponse.json(
      { message: "Failed to fetch customer", error: error.message },
      { status: 500 }
    );
    return cors(res);
  }
}
