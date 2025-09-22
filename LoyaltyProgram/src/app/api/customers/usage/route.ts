import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Just fetch **all customers** from DB (no shopId filter)
    const totalCount = await prisma.customer.count();

    return NextResponse.json({ count: totalCount });
  } catch (err: any) {
    console.error("[API] Error during customer sync:", err);
    return NextResponse.json(
      { error: "Failed to fetch customers", details: err.message },
      { status: 500 }
    );
  }
}
