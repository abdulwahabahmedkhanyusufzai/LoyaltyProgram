import React, { useState, useEffect } from "react";

const LoyaltyDashboard = ({ currentCustomers }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(currentCustomers[0] || null);

  const tiers = [
    { name: "Silver", img: "silver.png" },
    { name: "Bronze", img: "bronze.png" },
    { name: "Gold", img: "gold.png" },
    { name: "Diamond", img: "gem.png" },
  ];

  // Calculate progress percent to next tier (example: assume 100 points needed for next tier)
  const points = selectedCustomer?.loyaltyPoints || 0;
  const pointsToNextTier = 100 - points; // adjust based on your logic
  const progressPercent = ((points / 100) * 100).toFixed(2);

  // Sample recentTransactions array (replace with real data if available)
  const recentTransactions = selectedCustomer?.recentTransactions || [];

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
      <div className="flex flex-col md:flex-row justify-between items-center bg-[#F3F1E9] rounded-lg p-6 mb-6 shadow-md">
        <div className="flex-1">
          <p className="text-sm font-medium">Points Summary</p>
          <h1 className="text-4xl font-bold">{points}</h1>
          <p className="text-xs text-gray-600">
            Tier: <strong>{selectedCustomer?.loyaltyTitle}</strong> | {pointsToNextTier} points to next tier
          </p>

          {/* Tier Icons */}
          <div className="mt-4 w-full max-w-full">
            <div className="flex justify-between items-center mb-2">
              {tiers.map((tier, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center gap-1 ${
                    tier.name === selectedCustomer?.loyaltyTitle ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <span className="flex items-center justify-center w-[40px] h-[40px] border-[#734A00] border rounded-full">
                    <img src={tier.img} alt={`${tier.name} badge`} className="w-[23px] h-[23px] rounded-full" />
                  </span>
                  <span className="text-xs font-medium text-center">{tier.name}</span>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-4 bg-gray-300 rounded-full">
              <div
                className="absolute top-0 left-0 h-4 bg-[#A17C2D] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>

              {/* Points Badge */}
              <div
                className="absolute -top-6 px-2 py-1 bg-[#A17C2D] text-white text-xs rounded-lg font-semibold shadow-md"
                style={{ left: `${progressPercent}%`, transform: "translateX(-50%)" }}
              >
                {points}/100 pts
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
      </div>

      {/* Customer Stats */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <p className="text-sm font-medium mb-2">Customer Stats</p>
        <p>Total Orders: {selectedCustomer?.numberOfOrders}</p>
        <p>Total Spent: ${selectedCustomer?.amountSpent}</p>
        <p>Email: {selectedCustomer?.email}</p>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between mb-2 font-semibold">
          <span>Date</span>
          <span>Action</span>
          <span>Description</span>
          <span>Amount</span>
          <span>Points (+/-)</span>
        </div>
        <div className="divide-y divide-gray-200">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx, idx) => (
              <div key={idx} className="flex justify-between items-center py-2">
                <span className="w-24">{tx.date}</span>
                <span
                  className={`w-24 text-center px-2 py-1 rounded-full ${
                    tx.action === "Earned" ? "bg-[#A17C2D] text-white" : "bg-gray-300"
                  }`}
                >
                  {tx.action}
                </span>
                <span className="flex-1 px-2">{tx.description}</span>
                <span className="w-24 text-right">${tx.amount}</span>
                <span className={`w-24 text-right ${tx.points > 0 ? "text-green-600" : "text-red-600"}`}>
                  {tx.points > 0 ? `+${tx.points}` : tx.points}
                </span>
              </div>
            ))
          ) : (
            <div>No recent transactions.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyDashboard;
