import { NextResponse, NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";

// A list of all origins that are allowed to make requests
const allowedOrigins = [
  "https://storeplaidcocooningplaidfrenchfrancefrank.myshopify.com",
  "https://admin.shopify.com",
  "https://waro.d.codetors.dev",
];

/**
 * A helper function to add CORS headers to a response.
 * It dynamically checks the request's 'Origin' header against the allowed list.
 */
function withCors(request: NextRequest, res: NextResponse) {
  // Read the 'Origin' header from the *incoming request*
  const origin = request.headers.get("origin") || "";

  // Check if the request's origin is in our allowed list
  if (allowedOrigins.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  }

  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Allow-Credentials", "true");
  
  return res;
}

// Handle preflight CORS requests
export async function OPTIONS(request: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  // Pass the request to the helper
  return withCors(request, res);
}

// GET /api/customers/points
export async function GET(request: NextRequest) { // Use NextRequest here
  try {
    const customers = await prisma.customer.findMany({
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

    const result = customers.map((c) => ({
      id: c.id,
      loyaltyPoints: c.pointsLedger[0]?.balanceAfter ?? 0,
    }));

    const res = NextResponse.json(result, { status: 200 });
    // Pass the request to the helper
    return withCors(request, res);
  } catch (error) {
    console.error("Error fetching customers with points:", error);
    const res = NextResponse.json(
      { error: "Failed to fetch loyalty points" },
      { status: 500 }
    );
    // Pass the request to the helper
    return withCors(request, res);
  }
}