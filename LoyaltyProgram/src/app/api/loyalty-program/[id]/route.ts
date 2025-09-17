// app/api/loyalty-program/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
   context: RouteContext<'/api/loyalty-program/[id]'>
) {
  try {
    const params = await context.params;
    const { id } = params;
    const data = await req.json();
    const { tiers, rows } = data;

    const updatedProgram = await prisma.loyaltyProgram.update({
      where: { id: Number(id) },
      data: {
        ...(tiers && { tiers }),
        ...(rows && { rows }),
      },
    });

    return NextResponse.json({ success: true, program: updatedProgram });
  } catch (error) {
    console.error("🔥 Error updating loyalty program:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update program" },
      { status: 500 }
    );
  }
}
