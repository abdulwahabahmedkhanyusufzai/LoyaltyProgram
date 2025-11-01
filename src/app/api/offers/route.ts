import { NextResponse } from "next/server";
import { PrismaClient, type OfferType } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
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
  console.log("🟡 [POST] Offer creation initiated");

  try {
    const formData = await req.formData();
    console.log("📦 [DEBUG] Raw FormData keys:", Array.from(formData.keys()));

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const pointsCost = formData.get("pointsCost") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const file = formData.get("image") as File | null;
    const offerTypo = formData.get("offerType") as OfferType;

    if (!["DISCOUNT", "CASHBACK", "BOGO"].includes(offerTypo)) {
      console.error("❌ Invalid offerType received:", offerTypo);
      return jsonResponse({ error: "Invalid offerType" }, 400);
    }

    console.log("🔍 [DEBUG] Validated offerType:", offerTypo);

    const shop = await prisma.shop.findFirst();
    if (!shop) {
      console.error("❌ [ERROR] No shop found in database");
      return jsonResponse({ error: "No shop found. Please add one first." }, 404);
    }

    console.log("🏪 [DEBUG] Found shop:", shop.shop);

    let imageUrl: string | null = null;

     if (file) {
      console.log("🖼️ Uploading image to Shopify CDN...");

      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("shop", shop.shop); // e.g., "testingashir.myshopify.com"
      uploadForm.append("accessToken", shop.accessToken); // stored in DB

      const uploadRes = await fetch(`${req.headers.get("origin")}/api/upload-image`, {
        method: "POST",
        body: uploadForm,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.cdnUrl) {
        console.error("❌ Shopify upload failed:", uploadData);
        return jsonResponse(
          { error: "Failed to upload image to Shopify CDN", details: uploadData },
          500
        );
      }

      imageUrl = uploadData.cdnUrl;
      console.log("✅ Uploaded to Shopify CDN:", imageUrl);
    }

    console.log("🧱 [DEBUG] Creating new offer with data:", {
      name,
      description,
      pointsCost,
      startDate,
      endDate,
      imageUrl,
      offerType: offerTypo,
    });

    const newOffer = await prisma.offer.create({
      data: {
        name,
        description,
        pointsCost: pointsCost ? Number(pointsCost) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        image: imageUrl,
        offerType: offerTypo,
        value: 100
      },
    });

    console.log("✅ [SUCCESS] Offer created successfully:", newOffer);
    return jsonResponse({ success: true, offer: newOffer }, 201);
  } catch (error: any) {
    console.error("🔥 [ERROR] POST handler crashed:", error);
    return jsonResponse({ error: error.message || "Internal server error" }, 500);
  } finally {
    await prisma.$disconnect();
    console.log("🧹 [DEBUG] Prisma connection closed (POST)");
  }
}

// 🔹 READ (GET)
export async function GET() {
  console.log("🟢 [GET] Fetching offers...");

  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        image: true,
        createdAt: true,
        offerType: true,
      },
    });

     const shop = await prisma.shop.findFirst();
     console.log("🏪 [DEBUG] Found shop:", shop.shop);
    console.log(`✅ [SUCCESS] Retrieved ${offers.length} offers`);
    return jsonResponse({ offers });
  } catch (error: any) {
    console.error("🔥 [ERROR] GET handler crashed:", error);
    return jsonResponse({ error: error.message || "Internal server error" }, 500);
  } finally {
    await prisma.$disconnect();
    console.log("🧹 [DEBUG] Prisma connection closed (GET)");
  }
}

// 🔹 UPDATE (PUT)
export async function PUT(req: Request) {
  console.log("🟠 [PUT] Offer update initiated");

  try {
    const formData = await req.formData();
    console.log("📦 [DEBUG] Raw FormData keys:", Array.from(formData.keys()));

    const id = formData.get("id") as string;
    if (!id) {
      console.error("❌ [ERROR] No Offer ID provided");
      return jsonResponse({ error: "Offer ID is required" }, 400);
    }

    const updateData: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (value) updateData[key] = value;
    }

    if (updateData.image && updateData.image instanceof File) {
      console.log("🖼️ [DEBUG] Updating image for offer:", id);
      const bytes = await updateData.image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, updateData.image.name);
      await writeFile(filePath, buffer);
      updateData.image = `/uploads/${updateData.image.name}`;
    }

    console.log("🧱 [DEBUG] Updating offer with data:", updateData);

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: updateData,
    });

    console.log("✅ [SUCCESS] Offer updated successfully:", updatedOffer);
    return jsonResponse({ success: true, offer: updatedOffer });
  } catch (error: any) {
    console.error("🔥 [ERROR] PUT handler crashed:", error);
    return jsonResponse({ error: error.message || "Internal server error" }, 500);
  } finally {
    await prisma.$disconnect();
    console.log("🧹 [DEBUG] Prisma connection closed (PUT)");
  }
}
