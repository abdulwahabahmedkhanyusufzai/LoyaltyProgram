// app/api/offers/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

export async function PUT(req: Request, context: { params: Record<string, string> }) {  try {
    console.log("🚀 [PUT] /api/offers - Update request started");

    const { id } = context.params; 
    if (!id) {
      return NextResponse.json({ error: "Offer ID is missing in URL" }, { status: 400 });
    }

    const formData = await req.formData();
    console.log("📥 Raw formData keys:", [...formData.keys()]);

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const pointsCost = formData.get("pointsCost") as string;
    const discount = formData.get("discount") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const tiers = formData.getAll("tiers") as string[];
    const file = formData.get("image") as File | null;

    let imageUrl: string | undefined;

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
        ...(tiers?.length && { tiers }),
        ...(imageUrl !== undefined && { image: imageUrl }),
      },
    });

    return NextResponse.json({ success: true, offer: updatedOffer });
  } catch (error: unknown) {
    console.error("❌ Error updating offer:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
