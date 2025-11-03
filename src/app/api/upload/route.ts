import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
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

  let filePath = ""; // keep track to delete later

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
    const uploadDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uniqueFileName = `${uuidv4()}-${file.name}`;
    filePath = path.join(uploadDir, uniqueFileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);
    log("💾 File written to disk:", filePath);

    // Step 2: Public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_API_URL}uploads/${uniqueFileName}`;
    log("🌍 Public image URL for Shopify:", publicUrl);

    // Step 3: Upload to Shopify
    const uploadRes = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
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

    const shopifyResponse = await uploadRes.json();
    const fileCreate = shopifyResponse.data?.fileCreate;
    const uploadData = fileCreate?.files?.[0];
    const errors = fileCreate?.userErrors || [];

    if (!uploadData || errors.length > 0) {
      log("⚠️ Shopify returned errors:", errors);
      return NextResponse.json({ error: "Shopify upload failed", details: errors }, { status: 500 });
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

      const pollRes = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query }),
      });

      const pollData = await pollRes.json();
      const node = pollData.data?.node;
      status = node?.fileStatus;

      if (status === "READY") {
        cdnUrl = node?.image?.url;
        log("✅ File ready on Shopify CDN:", cdnUrl);

        // Step 5: Delete local file after successful upload
        try {
          await unlink(filePath);
          log("🗑️ Local upload file deleted:", filePath);
        } catch (unlinkErr) {
          log("⚠️ Failed to delete local file:", unlinkErr);
        }
      }
    }

    return NextResponse.json({ cdnUrl, fileId });
  } catch (err: any) {
    log("🔥 Fatal error:", err.message);

    // Ensure local file cleanup on failure
    if (filePath) {
      try {
        await unlink(filePath);
        log("🗑️ Local file deleted after failure:", filePath);
      } catch (_) {}
    }

    return NextResponse.json({ error: "Upload failed", message: err.message }, { status: 500 });
  }
};
