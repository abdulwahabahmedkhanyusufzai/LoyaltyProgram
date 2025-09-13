import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, pointsCost, discount, startDate, endDate, tiers, image } = body;

    if (!name || !description || !startDate || !endDate || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newOffer = await prisma.offer.create({
      data: {
        name,
        description,
        pointsCost,
        discount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        tiers,
        image,
      },
    });

    return NextResponse.json({ success: true, offer: newOffer }, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ offers });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
