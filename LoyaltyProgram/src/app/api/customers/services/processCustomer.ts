import { fetchCustomerMetrics } from "./fetchCustomerfromMetrics";
import { formatMoney } from "./formatMoney";

export async function processCustomer(shop: string, token: string, customer: any) {
  const email = (customer.email || `${customer.id}@noemail.local`).toLowerCase();
  const { ordersCount, totalAmountCents } = await fetchCustomerMetrics(shop, token, customer.id);

  return {
    ...customer,
    email,
    numberOfOrders: ordersCount,
    amountSpent: totalAmountCents / 100, // store as number
    amountSpentFormatted: formatMoney(totalAmountCents / 100),
   
     // for frontend
  };
}