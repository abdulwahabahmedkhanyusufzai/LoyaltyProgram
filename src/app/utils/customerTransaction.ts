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

        // Create a map of ledger entries by orderId for easy lookup
        const ledgerMap = new Map<string, LedgerEntry>();
        const manualLedgerEntries: LedgerEntry[] = [];

        loyaltyLedger.forEach((entry: LedgerEntry) => {
          if (entry.orderId) {
            ledgerMap.set(entry.orderId, entry);
          } else {
            manualLedgerEntries.push(entry);
          }
        });

        // 1. Map Orders to Transactions
        const orderTxs: Transaction[] = orders.map((order: Order) => {
          const ledgerEntry = ledgerMap.get(order.id);
          return {
            id: order.id, // Use order ID for uniqueness
            date: new Date(order.createdAt).toLocaleDateString(),
            action: "Order",
            description: `Order #${order.orderNumber}`,
            amount: Number(order.totalAmount),
            // Use ledger points if available, otherwise 0 (since we want to show real DB state)
            points: ledgerEntry ? ledgerEntry.change : 0, 
          };
        });

        // 2. Map Manual/Unlinked Ledger Entries to Transactions
        const manualTxs: Transaction[] = manualLedgerEntries.map((entry: LedgerEntry) => ({
          id: entry.id,
          date: new Date(entry.earnedAt).toLocaleDateString(),
          action: entry.sourceType || "Adjustment",
          description: entry.reason || "Points Adjustment",
          amount: 0,
          points: entry.change,
        }));

        // Combine and Sort
        const combinedTxs = [...orderTxs, ...manualTxs].sort(
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