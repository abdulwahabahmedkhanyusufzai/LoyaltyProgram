// src/hooks/useCustomerTransactions.js
import { useState, useEffect } from "react";

/**
 * Custom hook to fetch customer order data (transactions).
 * @param {string | null} customerId - The ID of the currently selected customer.
 */
const useCustomerTransactions = (customerId) => {
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        // NOTE: The API call logic remains the same.
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

        const { orders = [] } = data;

        // Map order data to transaction format
        const orderTxs = orders.map((order) => ({
          date: new Date(order.createdAt).toLocaleDateString(),
          action: "Order",
          description: `Order #${order.orderNumber}`,
          amount: Number(order.totalAmount),
          // Point calculation: simplified to 1 point per $10 spent
          points: Math.floor(Number(order.totalAmount) / 10),
          // Use orderNumber or another unique ID for keys
          id: order.orderNumber, 
        }));

        // Sort by date (newest first)
        const combinedTxs = orderTxs.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setRecentTransactions(combinedTxs);
      } catch (err) {
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