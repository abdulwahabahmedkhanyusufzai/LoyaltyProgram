const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    include: {
      _count: {
        select: { orders: true, pointsLedger: true },
      },
    },
  });

  console.log(`Found ${customers.length} customers.`);
  
  customers.forEach(c => {
    console.log(`[${c.id}] ${c.firstName} ${c.lastName} (${c.email}) - Orders: ${c._count.orders}, Ledger: ${c._count.pointsLedger}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
