// app/api/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();// adjust path to your prisma instance

export const POST = async (req: NextRequest) => {
  try {
    // Parse multipart/form-data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Fetch Shopify shop + token from DB (always shop with id = 2)
    const shop = await prisma.shop.findUnique({
      where: { id: 2 },
    });

    if (!shop || !shop.shop || !shop.accessToken) {
      return NextResponse.json(
        { error: "Shop not found or missing credentials" },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const fileName = file.name;

    // Shopify GraphQL Files API mutation
    const query = `
      mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            id
            alt
            createdAt
            fileStatus
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
          alt: fileName,
          contentType: "IMAGE",
          originalSource: `data:${file.type};base64,${base64}`,
        },
      ],
    };

    const res = await fetch(`https://${shop.shop}/admin/api/2024-07/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": shop.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await res.json();

    if (data.errors || data.data?.fileCreate?.userErrors?.length) {
      console.error("Shopify upload error:", data);
      return NextResponse.json(
        { error: "Shopify upload failed", details: data },
        { status: 500 }
      );
    }

    const uploadedFile = data.data.fileCreate.files[0];
    const url = uploadedFile.preview.image.url;

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
};
