import PQueue from "p-queue";
import { fetchAllCustomers } from "./fetchAllCustomers";
import { processCustomer } from "./processCustomer";
import { upsertCustomers } from "./upsertCustomers";
import { formatMoney } from "./formatMoney";

const CONCURRENCY = 5;
export async function fetchProcessUpsertCustomers(shopDomain: string, accessToken: string) {
  // Fetch all Shopify customers
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