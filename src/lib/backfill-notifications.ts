import { PrismaClient } from "@prisma/client";
import { fetchOrderProductImage } from "./shopify";

export async function runBackfill(prisma: PrismaClient) {
  console.log("Starting backfill of notification images...");

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        imageUrl: null,
        type: "order",
      },
    });

    console.log(`Found ${notifications.length} notifications to backfill.`);

    for (const notification of notifications) {
      const data = notification.data as any;
      if (data?.orderNumber) {
        console.log(`Processing notification ${notification.id} for order ${data.orderNumber}...`);
        
        // Pass the order number directly to the helper
        const imageUrl = await fetchOrderProductImage(data.orderNumber.toString());
        
        if (imageUrl) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: { imageUrl },
          });
          console.log(`✅ Updated notification ${notification.id} with image: ${imageUrl}`);
        } else {
          console.log(`❌ No image found for order ${data.orderNumber}.`);
        }
      }
    }

    console.log("Backfill complete.");
  } catch (error) {
    console.error("Error running backfill:", error);
  }
}
