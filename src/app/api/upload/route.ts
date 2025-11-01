import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const API_VERSION = "2025-10";

const uploadMutation = `
  mutation uploadFile($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        fileStatus
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shop = formData.get("shop") as string;
    const accessToken = formData.get("accessToken") as string;

    if (!file || !shop || !accessToken) {
      return NextResponse.json(
        { error: "Missing required fields (file, shop, accessToken)" },
        { status: 400 }
      );
    }

    // Step 1: Save file locally
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);

    // Step 2: Create a public URL (served by Next.js from /public)
    const publicUrl = `${req.nextUrl.origin}/uploads/${uniqueFileName}`;
    console.log("Public image URL for Shopify:", publicUrl);

    // Step 3: Upload to Shopify
    const uploadRes = await fetch(
      `https://${shop}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: uploadMutation,
          variables: {
            files: [
              {
                originalSource: publicUrl,
                contentType: "IMAGE",
                alt: file.name,
              },
            ],
          },
        }),
      }
    );

    const shopifyResponse = await uploadRes.json();
    const fileCreate = shopifyResponse.data?.fileCreate;
    const uploadData = fileCreate?.files?.[0];
    const errors = fileCreate?.userErrors || [];

    if (!uploadData || errors.length > 0) {
      return NextResponse.json(
        { error: "Shopify upload failed", details: errors },
        { status: 500 }
      );
    }

    const fileId = uploadData.id;
    let cdnUrl: string | null = null;
    let status = uploadData.fileStatus;

    // Step 4: Poll until fileStatus === READY
    while (status !== "READY") {
      const query = `
        query {
          node(id: "${fileId}") {
            ... on MediaImage {
              fileStatus
              image { url }
            }
          }
        }
      `;

      const pollRes = await fetch(
        `https://${shop}/admin/api/${API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({ query }),
        }
      );

      const pollData = await pollRes.json();
      const node = pollData.data?.node;
      status = node?.fileStatus;

      if (status === "READY") {
        cdnUrl = node?.image?.url;
      } else {
        // wait 2 seconds before polling again
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    return NextResponse.json({ cdnUrl, fileId });
  } catch (err: any) {
    console.error("Error uploading image:", err);
    return NextResponse.json(
      { error: "Upload failed", message: err.message },
      { status: 500 }
    );
  }
};
