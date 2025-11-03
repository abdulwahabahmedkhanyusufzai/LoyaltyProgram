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

interface CustomerApiResponse {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  numberOfOrders?: number;
  amountSpent?: number;
  loyaltyTitle?: string;
}

interface PointsResponse {
  id: string;
  loyaltyPoints: number;
}

export interface Customer {
  id: string;
  firstName:string;
  lastName:string;
  email: string;
  points: number;
  orders: number;
  initial: string;
  bgColor: string;
  amountSpent?: number;
  loyaltyTitle?: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);

      const resCustomers = await fetch(`/api/customers?first=10`);
      const customersData: { customers: CustomerApiResponse[] } = await resCustomers.json();

      const resPoints = await fetch(`/api/customers/points`);
      const pointsData: PointsResponse[] = await resPoints.json();

      if (customersData.customers) {
        const formatted: Customer[] = customersData.customers.map((c) => {
          const firstName = `${c.firstName ?? ""}`;
          const lastName =  `${c.lastName ?? ""}`.trim() || "Unknown";
          const email = c.email ?? "N/A";

          const initial = (name[0] || email[0] || "?").toUpperCase();
          const bgColor = getRandomColor(email || firstName);

          const pointsInfo = pointsData.find((p) => p.id === c.id);
          const totalPoints = pointsInfo?.loyaltyPoints ?? 0;

          return {
            id: c.id,
            firstName,
            lastName,
            email,
            points: totalPoints,
            orders: c.numberOfOrders ?? 0,
            initial,
            bgColor,
            amountSpent: c.amountSpent,
            loyaltyTitle: c.loyaltyTitle,
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
