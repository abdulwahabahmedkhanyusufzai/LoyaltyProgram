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

const log = (...args: any[]) => {
  console.log(`[${new Date().toISOString()}]`, ...args);
};

export const POST = async (req: NextRequest) => {
  log("🟡 [START] File upload endpoint hit");

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shop = formData.get("shop") as string;
    const accessToken = formData.get("accessToken") as string;

    if (!file || !shop || !accessToken) {
      log("❌ Missing fields:", { hasFile: !!file, shop, hasAccessToken: !!accessToken });
      return NextResponse.json(
        { error: "Missing required fields (file, shop, accessToken)" },
        { status: 400 }
      );
    }

    log("📦 Received upload:", { fileName: file.name, fileSize: file.size, shop });

    // Step 1: Save file locally
    const uploadDir = path.join(process.cwd(),"uploads");
    await mkdir(uploadDir, { recursive: true });

    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);
    log("💾 File written to disk:", filePath);

    // Step 2: Create a public URL (served by Next.js from /public)
    const publicUrl = `${process.env.NEXT_PUBLIC_API_URL}uploads/${uniqueFileName}`;
    log("🌍 Public image URL for Shopify:", publicUrl);

    // Step 3: Upload to Shopify
    let uploadRes: Response;
    try {
      uploadRes = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
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
      });
    } catch (fetchErr: any) {
      log("🔥 Shopify upload request failed:", fetchErr);
      throw new Error("Network error during Shopify upload");
    }

    let shopifyResponse;
    try {
      const rawText = await uploadRes.text();
      log("🧾 Shopify raw response:", rawText.slice(0, 400)); // limit length
      shopifyResponse = JSON.parse(rawText);
    } catch (jsonErr) {
      log("🚨 JSON parse error from Shopify response");
      throw new Error("Invalid JSON from Shopify API");
    }

    const fileCreate = shopifyResponse.data?.fileCreate;
    const uploadData = fileCreate?.files?.[0];
    const errors = fileCreate?.userErrors || [];

    if (!uploadData || errors.length > 0) {
      log("⚠️ Shopify returned errors:", errors);
      return NextResponse.json(
        { error: "Shopify upload failed", details: errors },
        { status: 500 }
      );
    }

    const fileId = uploadData.id;
    let cdnUrl: string | null = null;
    let status = uploadData.fileStatus;
    log("🪄 File created on Shopify:", { fileId, status });

    // Step 4: Poll until fileStatus === READY
    while (status !== "READY") {
      log("🔁 Polling file status:", status);
      await new Promise((r) => setTimeout(r, 2000));

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

      try {
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

        const pollText = await pollRes.text();
        log("📡 Poll response:", pollText.slice(0, 400));

        const pollData = JSON.parse(pollText);
        const node = pollData.data?.node;
        status = node?.fileStatus;

        if (status === "READY") {
          cdnUrl = node?.image?.url;
          log("✅ File ready on Shopify CDN:", cdnUrl);
        }
      } catch (pollErr: any) {
        log("⚠️ Polling error:", pollErr);
      }
    }

    log("🎉 Upload successful:", { fileId, cdnUrl });

    return NextResponse.json({ cdnUrl, fileId });
  } catch (err: any) {
    log("🔥 Fatal error:", err.message);
    return NextResponse.json(
      { error: "Upload failed", message: err.message },
      { status: 500 }
    );
  }
};
