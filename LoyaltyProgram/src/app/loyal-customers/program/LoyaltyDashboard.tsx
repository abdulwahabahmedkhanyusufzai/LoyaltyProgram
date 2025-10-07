import React, { useEffect, useState } from "react";

const LoyaltyDashboard = ({ currentCustomers }) => {
  console.log("LoyaltyDashboard currentCustomers:", currentCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState(currentCustomers[0] || null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const tiers = [
    { name: "Bronze", img: "bronze.png", min: 0, max: 99 },
    { name: "Silver", img: "silver.png", min: 100, max: 199 },
    { name: "Gold", img: "gold.png", min: 200, max: 299 },
    { name: "Diamond", img: "gem.png", min: 300, max: Infinity },
  ];

  const points = selectedCustomer?.loyaltyPoints || 0;
  const currentTier = tiers.find((tier) => points >= tier.min && points <= tier.max) || tiers[0];
  const currentTierIndex = tiers.findIndex((t) => t.name === currentTier.name);
  const nextTier = tiers[currentTierIndex + 1] || null;
  const pointsInTier = points - currentTier.min;
  const tierRange = nextTier ? nextTier.min - currentTier.min : 100;
  const tierProgress = nextTier ? (pointsInTier / tierRange) * 100 : 100;

  useEffect(() => {
    if (!selectedCustomer) return;

    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers/fetchOrders?customerId=${selectedCustomer.id}`);
        const data = await res.json();

        if (!res.ok) {
          console.error("Failed to fetch data:", data.error);
          setRecentTransactions([]);
          return;
        }

        const { orders = [] } = data;

        // Points per order: 1 point per 10 units spent
        const orderTxs = orders.map((order) => ({
          date: new Date(order.createdAt).toLocaleDateString(),
          action: "Order",
          description: `Order #${order.orderNumber}`,
          amount: order.totalAmount,
          points: Math.floor(Number(order.totalAmount) / 10),
        }));

        // Sort transactions by date descending
        const combinedTxs = orderTxs.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setRecentTransactions(combinedTxs);
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setRecentTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [selectedCustomer]);

  return (
    <div className="p-6 bg-[#FEFCE8] min-h-screen">
      {/* Customer Selector */}
      <div className="mb-4">
        <label className="text-sm font-medium mr-2">Select Customer:</label>
        <select
          className="border border-gray-300 rounded-lg px-3 py-1"
          value={selectedCustomer?.id}
          onChange={(e) => {
            const customer = currentCustomers.find((c) => c.id === e.target.value);
            setSelectedCustomer(customer);
          }}
        >
          {currentCustomers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.firstName} {customer.lastName} ({customer.email})
            </option>
          ))}
        </select>
      </div>

      {/* Points Summary */}
      <div className="flex flex-col bg-[#F3F1E9] rounded-lg p-6 mb-6 shadow-md">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium">Points Summary</p>
          {nextTier && (
            <p className="text-xs text-gray-600">
              You're {nextTier.min - points} points away from {nextTier.name} Tier
            </p>
          )}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#878787] bg-transparent shadow-sm">
            <span className="text-xs font-semibold text-[#734A00]">LVL:</span>
            <img src={currentTier.img} alt={`${currentTier.name} badge`} className="w-5 h-5 rounded-full" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">{points}</h1>

        {/* Progress Bar */}
        <div className="mt-4 w-full max-w-full">
          <div className="flex justify-between items-center mb-2">
            {tiers.map((tier, idx) => (
              <div key={idx} className={`flex flex-col items-center gap-1 ${tier.name === currentTier.name ? "opacity-100" : "opacity-50"}`}>
                <span className="flex items-center justify-center w-[40px] h-[40px] border-[#734A00] border rounded-full">
                  <img src={tier.img} alt={`${tier.name} badge`} className="w-[23px] h-[23px] rounded-full" />
                </span>
                <span className="text-xs font-medium text-center">{tier.name}</span>
              </div>
            ))}
          </div>
          <div className="relative flex w-full h-4 bg-gray-300 rounded-full overflow-hidden">
            {tiers.map((tier, idx) => {
              const segmentWidth = 100 / tiers.length;
              let fill = 0;
              if (idx < currentTierIndex) fill = 100;
              else if (idx === currentTierIndex) fill = tierProgress;
              return (
                <div key={idx} className="relative h-4" style={{ width: `${segmentWidth}%` }}>
                  <div className="h-4 bg-[#A17C2D] transition-all duration-500" style={{ width: `${fill}%` }}></div>
                </div>
              );
            })}
            <div className="absolute -top-6 px-2 py-1 bg-[#A17C2D] text-white text-xs rounded-lg font-semibold shadow-md"
                 style={{
                  left: `${((currentTierIndex + tierProgress / 100) / tiers.length) * 100}%`,
                  transform: "translateX(-50%)",
                 }}>
              {points} pts
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
        <table className="w-full text-left table-auto border-collapse">
          <thead className="border-b border-gray-300 font-semibold">
            <tr>
              <th className="px-2 py-2 w-24">Date</th>
              <th className="px-2 py-2 w-24 text-center">Action</th>
              <th className="px-2 py-2">Description</th>
              <th className="px-2 py-2 w-24 text-right">Amount</th>
              <th className="px-2 py-2 w-24 text-right">Points (+/-)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-gray-100 even:bg-gray-50">
                  <td className="px-2 py-2">{tx.date}</td>
                  <td className="px-2 py-2 text-center">
                    <span className={`px-2 py-1 rounded-[9px] bg-[#A17C2D] text-white`}>{tx.action}</span>
                  </td>
                  <td className="px-2 py-2">{tx.description}</td>
                  <td className="px-2 py-2 text-right">${tx.amount}</td>
                  <td className="px-2 py-2 text-right text-green-600">+{tx.points}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="text-center py-4">No recent transactions.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoyaltyDashboard;
