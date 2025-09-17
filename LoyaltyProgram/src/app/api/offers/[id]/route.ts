// app/api/offers/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// 🔹 helper to upload image to Shopify
async function uploadToShopify(file: File) {
  console.log("🟢 [uploadToShopify] Start uploading file:", {
    name: file.name,
    type: file.type,
    size: file.size,
  });

  const shop = await prisma.shop.findUnique({
    where: { id: 2 },
  });
  if (!shop || !shop.shop || !shop.accessToken) {
    throw new Error("❌ Shop #2 credentials missing");
  }

  // 1️⃣ Save file temporarily in /public/uploads
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const tempFileName = `${randomUUID()}-${file.name}`;
  const tempFilePath = path.join(uploadsDir, tempFileName);
  await fs.writeFile(tempFilePath, buffer);

  // Public URL that Shopify can fetch
  const tempFileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/uploads/${tempFileName}`;
  console.log("🌍 [uploadToShopify] Temp file URL:", tempFileUrl);

  // 2️⃣ Send URL to Shopify
  const mutation = `
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
          preview {
            image {
              url
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    files: [
      {
        alt: file.name,
        contentType: "IMAGE",
        originalSource: tempFileUrl,
      },
    ],
  };

  const res = await fetch(
    `https://${shop.shop}/admin/api/2024-07/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": shop.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: mutation, variables }),
    }
  );

  const data = await res.json();
  console.log("📡 [uploadToShopify] Shopify response:", data);

  if (data.errors?.length || data.data?.fileCreate?.userErrors?.length) {
    console.error("❌ [uploadToShopify] Shopify upload failed:", data);
    throw new Error(
      `Shopify upload failed: ${
        JSON.stringify(data.errors || data.data.fileCreate.userErrors)
      }`
    );
  }

  const uploadedUrl = data.data.fileCreate.files[0].preview.image.url;
  console.log("✅ [uploadToShopify] Upload successful. URL:", uploadedUrl);

  // 3️⃣ Delete temp file
  try {
    await fs.unlink(tempFilePath);
    console.log("🧹 [uploadToShopify] Temp file deleted:", tempFilePath);
  } catch (err) {
    console.warn("⚠️ [uploadToShopify] Failed to delete temp file:", err);
  }

  return uploadedUrl;
}

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    console.log("🟠 [PUT] API called with context:", context);

    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Offer ID is missing in URL" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

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
      imageUrl = await uploadToShopify(file);
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
    console.error("🔥 [PUT] Error updating offer:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
