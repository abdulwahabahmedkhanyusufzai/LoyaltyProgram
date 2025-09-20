import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function upsertCustomers(customers: any[]) {
  const upsertOps = customers.map((c) =>
    prisma.customer.upsert({
      where: { email: c.email },
      update: {
        firstName: c.firstName,
        lastName: c.lastName,
        numberOfOrders: c.numberOfOrders,
        amountSpent: c.amountSpent,
      },
      create: {
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        numberOfOrders: c.numberOfOrders,
        amountSpent: c.amountSpent,
      },
    })
  );

  await prisma.$transaction(upsertOps);
}