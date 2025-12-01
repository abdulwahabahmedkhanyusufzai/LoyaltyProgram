import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("DB URL:", process.env.DATABASE_URL);
  const count = await prisma.notification.count();
  console.log(`Total notifications: ${count}`);

  const notifications = await prisma.notification.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  console.log("Recent notifications:", JSON.stringify(notifications, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
