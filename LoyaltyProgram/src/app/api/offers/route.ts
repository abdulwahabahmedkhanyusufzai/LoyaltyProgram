import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 🔹 Use FormData because image will be a file, not JSON string
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const pointsCost = formData.get("pointsCost") as string;
    const discount = formData.get("discount") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const tiers = formData.getAll("tiers") as string[];
    const file = formData.get("image") as File | null;

    if (!name || !description || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;

    if (file) {
      // 🔹 Save image to /public/uploads
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, file.name);

      await writeFile(filePath, buffer);

      // 🔹 Public URL will be served from /uploads/filename
      imageUrl = `/uploads/${file.name}`;
    }

    // 🔹 Prepare data for DB
    const offerData = {
      name,
      description,
      pointsCost: pointsCost ? Number(pointsCost) : null,
      discount: discount ? Number(discount) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      tiers: Array.isArray(tiers) ? tiers : [tiers],
      image: imageUrl,
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

export async function GET() {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        pointsCost: true,
        discount: true,
        startDate: true,
        endDate: true,
        tiers: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ offers });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
