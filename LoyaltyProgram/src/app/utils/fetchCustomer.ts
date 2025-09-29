import { useCallback, useState } from "react";

const COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6",
];

function getRandomColor(seed: string) {
  const index =
    seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    COLORS.length;
  return COLORS[index];
}

export function useCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const resCustomers = await fetch(`/api/customers?first=10`);
      const customersData = await resCustomers.json();

      const resPoints = await fetch(`/api/customers/points`);
      const pointsData: { id: string; loyaltyPoints: number }[] = await resPoints.json();

      if (customersData.customers) {
        const formatted = customersData.customers.map((c: any) => {
          const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Unknown";
          const email = c.email ?? "N/A";

          const initial = (name[0] || email[0] || "?").toUpperCase();
          const bgColor = getRandomColor(email || name);

          const pointsInfo = pointsData.find((p) => p.id === c.id);
          const totalPoints = pointsInfo?.loyaltyPoints ?? 0;

          return {
            id: c.id,
            name,
            email,
            points: totalPoints,
            orders: c.numberOfOrders ?? 0,
            initial,
            bgColor,
          };
        });
        setCustomers(formatted);
      }
    } catch (err) {
      console.error("❌ Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { customers, loading, fetchCustomers };
}
