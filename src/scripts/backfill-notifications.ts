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

    if (data?.orderNumber) {
      console.log(`Processing notification ${notification.id} for order ${data.orderNumber}...`);
      
      // Pass the order number directly to the helper, which now handles variations
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
