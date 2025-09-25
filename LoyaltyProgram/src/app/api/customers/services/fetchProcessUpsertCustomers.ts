import PQueue from "p-queue";
import { fetchAllCustomers } from "./fetchAllCustomers";
import { processCustomer } from "./processCustomer";
import { upsertCustomers } from "./upsertCustomers";
import { formatMoney } from "./formatMoney";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CONCURRENCY = 5;

export async function fetchProcessUpsertCustomers(shopDomain: string, accessToken: string) {
  // 🔹 Step 1: Check if customers already exist in DB for this shop
  const existingCustomers = await prisma.customer.findMany();

  if (existingCustomers.length > 0) {
    // Stop here & return formatted data
    return existingCustomers.map((c) => ({
      ...c,
      amountSpent: formatMoney(Number(c.amountSpent)),
    }));
  }

  // 🔹 Step 2: Otherwise, fetch from Shopify
  const allCustomers = await fetchAllCustomers(shopDomain, accessToken);

  // Process customers concurrently
  const queue = new PQueue({ concurrency: CONCURRENCY });
  const processedCustomers = await Promise.all(
    allCustomers.map((c) => queue.add(() => processCustomer(shopDomain, accessToken, c)))
  );

  // Upsert all processed customers
  await upsertCustomers(processedCustomers);

  // Format for frontend
  return processedCustomers.map((c) => ({
    ...c,
    amountSpent: formatMoney(c.amountSpent),
  }));
}
