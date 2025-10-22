import { prisma } from "../../../../lib/prisma";

export async function upsertCustomers(customers: any[]) {
  const upsertOps = customers.map((c) =>
    prisma.customer.upsert({
      where: { email: c.email },
      update: {
        firstName: c.firstName ?? "" ,
        lastName: c.lastName ?? "",
        loyaltyTitle: c.loyaltyTitle ?? "",
        numberOfOrders: c.numberOfOrders ?? 0,
        amountSpent: c.amountSpent ?? 0,
      },
      create: {
        shopifyId: c.id ?? "",
        firstName: c.firstName ?? "",
        lastName: c.lastName ?? "",
        email: c.email ?? "",
        loyaltyTitle: c.loyaltyTitle ?? "",
        numberOfOrders: c.numberOfOrders ?? "",
        amountSpent: c.amountSpent ?? "",
      },
    })
  );

  await prisma.$transaction(upsertOps);
}
