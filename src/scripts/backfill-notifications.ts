import { PrismaClient } from "@prisma/client";
import { fetchOrderProductImage } from "../lib/shopify";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting backfill of notification images...");

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
      console.log(`Processing notification ${notification.id} for order #${data.orderNumber}...`);
      
      // Order number in notification data might be just the number (e.g. "1035")
      // fetchOrderProductImage expects the order name (e.g. "#1035")
      // If data.orderNumber already has #, don't add it.
      const orderName = data.orderNumber.toString().startsWith("#") 
        ? data.orderNumber 
        : `#${data.orderNumber}`;
      
      const imageUrl = await fetchOrderProductImage(orderName);
      
      if (imageUrl) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: { imageUrl },
        });
        console.log(`Updated notification ${notification.id} with image.`);
      } else {
        console.log(`No image found for order ${orderName}.`);
      }
    }
  }

  console.log("Backfill complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
