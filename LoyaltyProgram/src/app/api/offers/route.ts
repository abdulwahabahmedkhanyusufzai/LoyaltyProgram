import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// Utility logger (extendable)
function logStep(step: string, data?: unknown) {
  console.log(`[OffersAPI] ${step}`, data ?? "");
}

// Utility error logger
function logError(step: string, error: any) {
  console.error(`[OffersAPI] ❌ Error at ${step}:`, {
    message: error?.message,
    stack: error?.stack,
    code: error?.code,
    meta: error?.meta,
  });
}

// 🔹 CREATE (POST)
export async function POST(req: Request) {
  logStep("POST handler started");

  try {
    const formData = await req.formData();
    logStep("Received formData keys", Array.from(formData.keys()));

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const pointsCost = formData.get("pointsCost") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const tierRequired = formData.get("tierRequired") as string;
    const file = formData.get("image") as File | null;
    const offerType = formData.get("offerType") as string;

    logStep("Parsed fields", { name, description, pointsCost, startDate, endDate, tierRequired, offerType });

    // Validate required fields
    if (!name || !description || !startDate || !endDate || !tierRequired || !offerType) {
      logError("POST validation", "Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;

    if (file) {
      logStep("Handling file upload", { fileName: file.name, fileType: file.type, fileSize: file.size });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, file.name);

      await writeFile(filePath, buffer);
      logStep("File saved", { filePath });

      imageUrl = `/uploads/${file.name}`;
    }

    const offerData = {
      name,
      description,
      pointsCost: pointsCost ? Number(pointsCost) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      tierRequired,
      image: imageUrl,
      offerType,
      value: 100,
    };

    logStep("Creating offer with data", offerData);

    const newOffer = await prisma.offer.create({ data: offerData });
    logStep("Offer created successfully", newOffer);

    return NextResponse.json({ success: true, offer: newOffer }, { status: 201 });
  } catch (error: any) {
    logError("POST", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// 🔹 READ (GET)
export async function GET() {
  logStep("GET handler started");

  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        tierRequired: true,
        description: true,
        pointsCost: true,
        startDate: true,
        endDate: true,
        image: true,
        createdAt: true,
        offerType: true,
      },
    });

    logStep("Fetched offers", { count: offers.length });

    return NextResponse.json({ offers });
  } catch (error: any) {
    logError("GET", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        stack: error.stack,
        code: error.code,
        meta: error.meta,
      },
      { status: 500 }
    );
  }
}

// 🔹 UPDATE (PUT)
export async function PUT(req: Request) {
  logStep("PUT handler started");

  try {
    const formData = await req.formData();
    logStep("Received formData keys", Array.from(formData.keys()));

    const id = formData.get("id") as string;
    if (!id) {
      logError("PUT validation", "Offer ID is required");
      return NextResponse.json({ error: "Offer ID is required" }, { status: 400 });
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const pointsCost = formData.get("pointsCost") as string;
    const discount = formData.get("discount") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const tiers = formData.get("tiers") as string;
    const file = formData.get("image") as File | null;

    let imageUrl: string | undefined = undefined;

    if (file) {
      logStep("Handling file upload", { fileName: file.name });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, file.name);

      await writeFile(filePath, buffer);
      logStep("File saved", { filePath });

      imageUrl = `/uploads/${file.name}`;
    }

    const updateData: any = {
      ...(name && { name }),
      ...(description && { description }),
      ...(pointsCost && { pointsCost: Number(pointsCost) }),
      ...(discount && { discount: Number(discount) }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(tiers && { tierRequired: tiers }),
      ...(imageUrl !== undefined && { image: imageUrl }),
    };

    logStep("Updating offer", { id, updateData });

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: updateData,
    });

    logStep("Offer updated successfully", updatedOffer);

    return NextResponse.json({ success: true, offer: updatedOffer });
  } catch (error: any) {
    logError("PUT", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
