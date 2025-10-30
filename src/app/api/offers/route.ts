import { NextResponse } from "next/server";
import { PrismaClient, type OfferType } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

function jsonResponse(data: any, status = 200) {
  const res = NextResponse.json(data, { status });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

// Handle preflight CORS requests
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

// 🔹 CREATE (POST)
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const pointsCost = formData.get("pointsCost") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const file = formData.get("image") as File | null;
    const offerTypo = formData.get("offerType") as "DISCOUNT" | "CASHBACK" | "BOGO";

    if (!["DISCOUNT", "CASHBACK", "BOGO"].includes(offerTypo))
      return jsonResponse({ error: "Invalid offerType" }, 400);
    
    const shop = await prisma.shop.findFirst();
    console.log("shop",shop);
    let imageUrl: string | null = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, file.name);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${file.name}`;
    }

    const newOffer = await prisma.offer.create({
      data: {
        name,
        description,
        pointsCost: pointsCost ? Number(pointsCost) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        image: imageUrl,
        offerType: offerTypo as OfferType,
        value: 100,
      },
    });

    return jsonResponse({ success: true, offer: newOffer }, 201);
  } catch (error: any) {
    return jsonResponse({ error: error.message || "Internal error" }, 500);
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
        offerType: true,
      },
    });
    return jsonResponse({ offers });
  } catch (error: any) {
    return jsonResponse({ error: error.message || "Internal error" }, 500);
  }
}

// 🔹 UPDATE (PUT)
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    if (!id) return jsonResponse({ error: "Offer ID is required" }, 400);

    const updateData: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (value) updateData[key] = value;
    }

    if (updateData.image && updateData.image instanceof File) {
      const bytes = await updateData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(process.cwd(), "public", "uploads", updateData.image.name);
      await writeFile(filePath, buffer);
      updateData.image = `/uploads/${updateData.image.name}`;
    }

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: updateData,
    });

    return jsonResponse({ success: true, offer: updatedOffer });
  } catch (error: any) {
    return jsonResponse({ error: error.message || "Internal error" }, 500);
  }
}
