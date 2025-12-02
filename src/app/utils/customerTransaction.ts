// src/hooks/useCustomerTransactions.ts
import { useState, useEffect } from "react";

interface Transaction {
  id: string;
  date: string;
  action: string;
  description: string;
  amount: number;
  points: number;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: string | number;
  createdAt: string;
}

interface LedgerEntry {
  id: string;
  orderId?: string;
  earnedAt: string;
  sourceType: string;
  reason: string;
  change: number;
}

/**
 * Custom hook to fetch customer order data (transactions).
 * @param {string | null} customerId - The ID of the currently selected customer.
 */
const useCustomerTransactions = (customerId: string | null | undefined) => {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setRecentTransactions([]);
      setError(null);
      return;
    }

    const fetchCustomerData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/customers/fetchOrders?customerId=${customerId}`
        );
        const data = await res.json();

        if (!res.ok) {
          console.error("Failed to fetch data:", data.error);
          setError(data.error || "Failed to fetch transactions.");
          setRecentTransactions([]);
          return;
        }

        const { orders = [], loyaltyLedger = [] } = data;

        // Create a map of orders for easy lookup if needed (e.g. to get order amount)
        const orderMap = new Map<string, Order>(orders.map((o: Order) => [o.id, o]));

        // Map ledger data to transaction format
        const ledgerTxs: Transaction[] = loyaltyLedger.map((entry: LedgerEntry) => {
          const relatedOrder = entry.orderId ? orderMap.get(entry.orderId) : null;
          
          return {
            date: new Date(entry.earnedAt).toLocaleDateString(),
            action: entry.sourceType || "Adjustment", // e.g. "ORDER", "MANUAL", "REFERRAL"
            description: entry.reason || (relatedOrder ? `Order #${relatedOrder.orderNumber}` : "Points Adjustment"),
            amount: relatedOrder ? Number(relatedOrder.totalAmount) : 0, // Show amount only if linked to an order
            points: entry.change,
            id: entry.id,
          };
        });

        // Sort by date (newest first)
        const combinedTxs = ledgerTxs.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setRecentTransactions(combinedTxs);
      } catch (err: any) {
        console.error("Error fetching customer data:", err);
        setError("Network or parsing error. Check console for details.");
        setRecentTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId]); // Only re-run when the customerId changes

  return { recentTransactions, loading, error };
};

export default useCustomerTransactions;