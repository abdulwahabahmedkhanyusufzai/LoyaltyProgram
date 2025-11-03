// app/api/offers/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { jsonResponse } from "../route";

export async function PUT(
  req: Request,
 context: RouteContext<'/api/offers/[id]'>
) {
  try {
    const params = await context.params;
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Offer ID is missing in URL" }, { status: 400 });
    }

    const formData = await req.formData();
    console.log("📥 Raw formData keys:", [...formData.keys()]);

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const discount = formData.get("discount") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const file = formData.get("image") as File | null;
    
     const shop = await prisma.shop.findFirst();
    if (!shop) {
      console.error("❌ [ERROR] No shop found in database");
      return jsonResponse({ error: "No shop found. Please add one first." }, 404);
    }

    console.log("🏪 [DEBUG] Found shop:", shop.shop);

    let imageUrl: string | undefined;

        if (file) {
      console.log("🖼️ Uploading image to Shopify CDN...");
      
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("shop", shop.shop); // e.g., "testingashir.myshopify.com"
      uploadForm.append("accessToken", shop.accessToken); // stored in DB

      const uploadRes = await fetch(`${req.headers.get("origin")}/api/upload`, {
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

    
   

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(discount && { discount: Number(discount) }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(imageUrl !== undefined && { image: imageUrl }),
      },
    });

    console.log(updatedOffer);
    return NextResponse.json({ success: true, offer: updatedOffer });
  } catch (error: unknown) {
    console.error("❌ Error updating offer:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
