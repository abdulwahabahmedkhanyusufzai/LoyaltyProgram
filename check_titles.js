const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const titles = await prisma.customer.groupBy({
    by: ['loyaltyTitle'],
    _count: {
      loyaltyTitle: true,
    },
  });
  console.log('Distinct Loyalty Titles:', titles);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
