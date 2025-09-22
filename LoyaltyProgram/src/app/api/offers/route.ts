import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// 🔹 CREATE (POST)
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const pointsCost = formData.get("pointsCost") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const tiers = formData.get("tiers") as string;
    const file = formData.get("image") as File | null;

    if (!name || !description || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, file.name);

      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${file.name}`;
    }

    const offerData = {
      name,
      description,
      pointsCost: pointsCost ? Number(pointsCost) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      tierRequired: tiers,
      image: imageUrl,
    offerType: "DISCOUNT", // or whatever your enum/string allows
    value: 100, 
    };

    const newOffer = await prisma.offer.create({ data: offerData });
    return NextResponse.json({ success: true, offer: newOffer }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error creating offer:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
// 🔹 READ (GET)
export async function GET() {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        pointsCost: true,
        startDate: true,
        endDate: true,
        image: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({ offers });
  } catch (error: any) {
    // Print full error object in server logs
    console.error("🔥 Prisma GET error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        stack: error.stack, // shows exact line in prisma/client
        code: error.code,   // Prisma error code (e.g., P2022, P2025)
        meta: error.meta,   // Extra details like which field failed
      },
      { status: 500 }
    );
  }
}


// 🔹 UPDATE (PUT)
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();

    const id = formData.get("id") as string;
    if (!id) {
      return NextResponse.json({ error: "Offer ID is required" }, { status: 400 });
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const pointsCost = formData.get("pointsCost") as string;
    const discount = formData.get("discount") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const tiers = formData.getAll("tiers") as string[];
    const file = formData.get("image") as File | null;

    let imageUrl: string | undefined = undefined;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, file.name);

      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${file.name}`;
    }

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(pointsCost && { pointsCost: Number(pointsCost) }),
        ...(discount && { discount: Number(discount) }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(tiers && tiers.length > 0 && { tiers }),
        ...(imageUrl !== undefined && { image: imageUrl }),
      },
    });

    return NextResponse.json({ success: true, offer: updatedOffer });
  } catch (error: any) {
    console.error("❌ Error updating offer:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
