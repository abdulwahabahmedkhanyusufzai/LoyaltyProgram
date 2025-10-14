import { customerService } from "@/app/utils/CustomerService";
import { useEffect, useState } from "react";

export function useCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

 useEffect(() => {
  async function loadData() {
    setLoading(true);
    try {
      const [fetchedCustomers, count, pointsData] = await Promise.all([
        customerService.fetchCustomers(),
        customerService.fetchCustomerCount(),
        customerService.fetchCustomerPoints()
      ]);

      // Convert pointsData to a map: { id -> loyaltyPoints }
      const pointsMap = new Map(pointsData.map(p => [p.id, p.loyaltyPoints]));

      // Attach points to each customer
      const customersWithPoints = fetchedCustomers.map(cust => ({
        ...cust,
        loyaltyPoints: pointsMap.get(cust.id) ?? 0
      }));
       console.log("Fetched customers with points:", customersWithPoints);
      // Example: sort by spent or points
      const sortedCustomers = [...customersWithPoints].sort(
        (a, b) => (b.amountSpent ?? 0) - (a.amountSpent ?? 0)
      );

      setCustomers(sortedCustomers);
      setTotalCount(count);
    } catch (error) {
      console.error("❌ Error loading customer data:", error);
    } finally {
      setLoading(false);
    }
  }
  loadData();
}, []);

  return { customers, totalCount, loading };
}

