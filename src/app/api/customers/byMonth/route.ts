// File: /pages/api/customers-last-order.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req:Request) {
  try {
    // Fetch customers who have at least one order
    const customers = await prisma.customer.findMany({
      where: {
        numberOfOrders: { gt: 0 },
      },
      include: {
        orders: {
          orderBy: {
            createdAt: "desc", // get latest orders first
          },
          take: 1, // only the last order
          include: {
            items: true, // optional: include order items
          },
        },
        pointsLedger: {
          orderBy: { earnedAt: "desc" },
          take: 1, // last point entry
        },
      },
    });

    // Format response if needed
    const response = customers.map((customer) => ({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      loyaltyTitle: customer.loyaltyTitle,
      numberOfOrders: customer.numberOfOrders,
      amountSpent: Number(customer.amountSpent),
      lastOrder: customer.orders[0] || null,
      lastPointsEntry: customer.pointsLedger[0] || null,
    }));

    return NextResponse.json({ customers: response },{status:200});
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" },{status:400});
  } finally {
    await prisma.$disconnect();
  }
}
