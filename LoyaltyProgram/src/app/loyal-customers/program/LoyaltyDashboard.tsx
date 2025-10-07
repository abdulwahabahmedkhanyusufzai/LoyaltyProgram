import React, { useState } from "react";

const LoyaltyDashboard = ({ currentCustomers }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(
    currentCustomers[0] || null
  );

  // Define tiers with ranges
  const tiers = [
    { name: "Bronze", img: "bronze.png", min: 0, max: 99 },
    { name: "Silver", img: "silver.png", min: 100, max: 199 },
    { name: "Gold", img: "gold.png", min: 200, max: 299 },
    { name: "Diamond", img: "gem.png", min: 300, max: Infinity },
  ];

  const points = selectedCustomer?.loyaltyPoints || 0;

  // Find current tier based on points
  const currentTier =
    tiers.find((tier) => points >= tier.min && points <= tier.max) || tiers[0];

  const currentTierIndex = tiers.findIndex((t) => t.name === currentTier.name);
  const nextTier = tiers[currentTierIndex + 1] || null;

  const pointsInTier = points - currentTier.min;
  const tierRange = nextTier ? nextTier.min - currentTier.min : 100; // fallback
  const tierProgress = nextTier ? (pointsInTier / tierRange) * 100 : 100;

  const recentTransactions = selectedCustomer?.recentTransactions || [];

  return (
    <>
    <div className="p-6 bg-[#FEFCE8] min-h-screen">
      {/* Customer Selector */}
      <div className="mb-4">
        <label className="text-sm font-medium mr-2">Select Customer:</label>
        <select
          className="border border-gray-300 rounded-lg px-3 py-1"
          value={selectedCustomer?.id}
          onChange={(e) => {
            const customer = currentCustomers.find(
              (c) => c.id === e.target.value
            );
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
  {/* Top Row: Points Summary + LVL badge */}
  

  <div className="flex justify-between items-center mb-2">
    <p className="text-sm font-medium">Points Summary</p>

    {/* LVL pill */}
    {nextTier && (
    <p className="text-xs text-gray-600">
      You're {nextTier.min - points} Points away from {nextTier.name} Tier
    </p>
  )}
    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#878787] bg-transparent shadow-sm">
      <span className="text-xs font-semibold text-[#734A00]">LVL:</span>
      <img
        src={currentTier.img}
        alt={`${currentTier.name} badge`}
        className="w-5 h-5 rounded-full"
      />
    </div>
  </div>

  {/* Points number */}
  <h1 className="text-4xl font-bold">{points}</h1>
  

  {/* Progress + Tier Icons */}
  <div className="mt-4 w-full max-w-full">
    <div className="flex justify-between items-center mb-2">
      {tiers.map((tier, idx) => (
        <div
          key={idx}
          className={`flex flex-col items-center gap-1 ${
            tier.name === currentTier.name ? "opacity-100" : "opacity-50"
          }`}
        >
          <span className="flex items-center justify-center w-[40px] h-[40px] border-[#734A00] border rounded-full">
            <img
              src={tier.img}
              alt={`${tier.name} badge`}
              className="w-[23px] h-[23px] rounded-full"
            />
          </span>
          <span className="text-xs font-medium text-center">{tier.name}</span>
        </div>
      ))}
    </div>

    {/* Segmented Progress Bar */}
    <div className="relative flex w-full h-4 bg-gray-300 rounded-full overflow-hidden">
      {tiers.map((tier, idx) => {
        const segmentWidth = 100 / tiers.length;
        let fill = 0;
        if (idx < currentTierIndex) fill = 100;
        else if (idx === currentTierIndex) fill = tierProgress;

        return (
          <div
            key={idx}
            className="relative h-4"
            style={{ width: `${segmentWidth}%` }}
          >
            <div
              className="h-4 bg-[#A17C2D] transition-all duration-500"
              style={{ width: `${fill}%` }}
            ></div>
          </div>
        );
      })}

      {/* Points Badge */}
      <div
        className="absolute -top-6 px-2 py-1 bg-[#A17C2D] text-white text-xs rounded-lg font-semibold shadow-md"
        style={{
          left: `${((currentTierIndex + tierProgress / 100) / tiers.length) * 100}%`,
          transform: "translateX(-50%)",
        }}
      >
        {points} pts
      </div>
    </div>
  </div>
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
                    tx.action === "Earned"
                      ? "bg-[#A17C2D] text-white"
                      : "bg-gray-300"
                  }`}
                >
                  {tx.action}
                </span>
                <span className="flex-1 px-2">{tx.description}</span>
                <span className="w-24 text-right">${tx.amount}</span>
                <span
                  className={`w-24 text-right ${
                    tx.points > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
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

     
</>
  );
};

export default LoyaltyDashboard;
