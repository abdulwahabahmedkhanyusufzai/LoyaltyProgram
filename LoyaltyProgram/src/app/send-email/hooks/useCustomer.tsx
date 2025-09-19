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
        const [fetchedCustomers, count] = await Promise.all([
          customerService.fetchCustomers(),
          customerService.fetchCustomerCount(),
        ]);
        setCustomers(fetchedCustomers);
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

