import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { tiers, rows } = data;
    const savedProgram = await prisma.loyaltyProgram.create({
      data: { tiers, rows },
    });
    return NextResponse.json({ success: true, program: savedProgram });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to save program" },
      { status: 500 }
    );
  }
}
