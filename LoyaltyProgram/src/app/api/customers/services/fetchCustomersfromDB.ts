// services/fetchCustomersFromDB.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function fetchCustomersFromDB() {
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      loyaltyTitle: true,   // <- always select this
      numberOfOrders: true,
      amountSpent: true,
    },
  });

  // Format amountSpent for frontend
  return customers.map((c) => ({
    ...c,
    loyaltyTitle: c.loyaltyTitle || "—", // show placeholder if null
    amountSpent: Number(c.amountSpent.toFixed(2)),
  }));
}
