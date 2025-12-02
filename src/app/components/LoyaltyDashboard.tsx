// src/components/LoyaltyDashboard.jsx
import React, { useState, useMemo } from "react";
import { LOYALTY_TIERS, getCustomerTier } from "../../constants/loyaltyTier"; 
import useCustomerTransactions from "../utils/customerTransaction";

// Helper for formatting currency
const formatCurrency = (amount) =>
new Intl.NumberFormat('en-US', {
style: 'currency',
currency: 'USD',
}).format(amount);

const LoyaltyDashboard = ({ currentCustomers }) => {
    const [selectedCustomer, setSelectedCustomer] = useState(currentCustomers[0] || null);

    const { recentTransactions, loading, error } = useCustomerTransactions(selectedCustomer?.id);

    const { points, currentTier, nextTier, relativeProgress } = useMemo(() => {
        const custPoints = selectedCustomer?.loyaltyPoints || 0;
        const cTier = getCustomerTier(custPoints);

        const currentTierIndex = LOYALTY_TIERS.findIndex((t) => t.name === cTier.name);
        const nTier = LOYALTY_TIERS[currentTierIndex + 1] || null;

        const tierMin = cTier.min;

        let progress = 0;
        if (!nTier) {
            progress = 100;
        } else {
            const tierMax = nTier.min;
            const range = tierMax - tierMin;
            progress = range > 0 ? ((custPoints - tierMin) / range) * 100 : 0;
        }

        return { 
            points: custPoints, 
            currentTier: cTier, 
            nextTier: nTier, 
            relativeProgress: Math.min(Math.max(progress, 0), 100) 
        };
    }, [selectedCustomer]);

    // ⭐ KEY FLAGS
    const isNoTier = currentTier.name === "No Tier";

    // ⭐ SCALING LOGIC FOR VISUAL LAYOUT (The main fix for the misleading bar)
    // Assuming the full bar represents 4 tiers (Bronze, Silver, Gold, Platinum)
    // The "No Tier" progress (0-100%) maps to the first 25% of the full bar.
    let progressForVisualization = relativeProgress;
    if (isNoTier) {
        // If in No Tier (0-100% progress toward Bronze), scale this to 0-25% of the total bar width.
        progressForVisualization = relativeProgress / 4;
    } 
    // If in a higher tier, relativeProgress already tracks the progress within that tier's segment.
    // To position the marker absolutely, we need the total offset from 0.

    // Calculate total absolute percentage offset for Bronze+ tiers:
    if (!isNoTier && currentTier.min > 0 && LOYALTY_TIERS.length > 1) {
    }
    
    // ⭐ SAFETY CLAMP for marker (use the newly scaled value for position)
    const safeProgress = Math.min(Math.max(progressForVisualization, 2), 98);


return (
<div className="p-6 bg-[#FEFCE8] min-h-screen">
    {/* Customer Selector (Unchanged) */}
    <div className="mb-4">
        <label htmlFor="customer-select" className="text-sm font-medium mr-2">Select Customer:</label>
        <select
            id="customer-select"
            className="w-[300px] md:w-full border border-gray-300 rounded-lg px-3 py-1"
            value={selectedCustomer?.id || ""}
            onChange={(e) => {
                const customer = currentCustomers.find((c) => c.id === e.target.value);
                setSelectedCustomer(customer);
            }}
        >
            {!selectedCustomer && <option value="">Select a Customer</option>}
            {currentCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName} ({customer.email})
                </option>
            ))}
        </select>
    </div>

    {selectedCustomer ? (
        <>
            {/* Points Summary (Updated for clearer messaging) */}
            <div className="flex flex-col bg-[#F3F1E9] rounded-lg p-6 mb-6 shadow-md">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Points Summary</p>
                    {isNoTier ? (
                        <p className="text-xs text-gray-600">
                            You're {LOYALTY_TIERS[1].min - points} points away from{" "}
                            <span className="font-semibold text-[#A17C2D]">{LOYALTY_TIERS[1].name} Tier</span>
                        </p>
                    ) : nextTier ? (
                        <p className="text-xs text-gray-600">
                            You're {Math.max(nextTier.min - points, 0)} points away from{" "}
                            <span className="font-semibold text-[#A17C2D]">{nextTier.name} Tier</span>
                        </p>
                    ) : (
                        <p className="text-xs text-gray-600 font-semibold">
                            You've reached the highest {currentTier.name} Tier! 🏆
                        </p>
                    )}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#878787] bg-transparent shadow-sm">
                        <span className="text-xs font-semibold text-[#734A00]">LVL: {currentTier.name}</span>
                        {currentTier.name === "No Tier"  ? 
                        (
                            <div></div>
                        ):(<img
                            src={currentTier.img}
                            alt={`${currentTier.name} badge`}
                            className="w-5 h-5 rounded-full"
                        />)}
                    </div>
                </div>
                <h1 className="text-4xl font-bold">{points.toLocaleString()}</h1>

                {/* ⭐ START: PROGRESS BAR WITH SCALING FIX */}
                <div className="mt-8 w-full max-w-full">
                    {/* Multi-Tier Labels: ALWAYS show all tiers for the desired look */}
                    <div className="flex justify-between items-end mb-4 relative">
                        {LOYALTY_TIERS.slice(1).map((tier, idx) => ( 
                            <div
                                key={idx}
                                // Ensure markers are correctly spaced out across the full bar width (25% each)
                                className={`flex flex-col items-center gap-1 w-1/4 last:w-auto last:ml-auto ${
                                    points >= tier.min ? "opacity-100" : "opacity-40"
                                }`}
                            >
                                <span className="flex items-center justify-center w-[40px] h-[40px] border-[#734A00] border rounded-full bg-white shadow-sm">
                                    <img
                                        src={tier.img}
                                        alt={`${tier.name} badge`}
                                        className="w-[23px] h-[23px] rounded-full"
                                    />
                                </span>
                                <span className="text-xs font-medium text-center">
                                    {tier.name}
                                </span>
                                <span className="text-[10px] text-gray-500 font-light">
                                    {tier.min.toLocaleString()} pts
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar Track */}
                    <div className="relative w-full h-4 bg-gray-300 rounded-full overflow-visible">
                        {/* Marker: Positioned using the scaled value */}
                        <div
                            className="absolute -top-7 px-2 py-1 bg-[#A17C2D] text-white text-xs rounded-lg font-semibold shadow-md z-10"
                            style={{
                                left: `${safeProgress}%`,
                                transform: "translateX(-50%)",
                            }}
                        >
                            {points.toLocaleString()} pts
                        </div>

                        {/* Progress Fill: Width set using the scaled value */}
                        <div
                            className="h-4 bg-[#A17C2D] rounded-full transition-all duration-500"
                            style={{
                                width: `${progressForVisualization}%`,
                            }}
                        ></div>
                    </div>
                </div>
                {/* ⭐ END: PROGRESS BAR WITH SCALING FIX */}
            </div>

            {/* Recent Transactions Table (Unchanged) */}
            <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Recent Transactions</h2>
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
                        {error ? (
                            <tr><td colSpan={5} className="text-center py-4 text-red-600 font-medium">Error loading data: {error}</td></tr>
                        ) : loading ? (
                            <tr><td colSpan={5} className="text-center py-4">Loading transactions...</td></tr>
                        ) : recentTransactions.length > 0 ? (
                            recentTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-100 even:bg-gray-50">
                                    <td className="px-2 py-2">{tx.date}</td>
                                    <td className="px-2 py-2 text-center">
                                        <span className="px-2 py-1 rounded-[9px] bg-[#A17C2D] text-white text-xs">
                                            {tx.action}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2">{tx.description}</td>
                                    <td className="px-2 py-2 text-right">{formatCurrency(tx.amount)}</td>
                                    <td className={`px-2 py-2 text-right font-medium ${tx.points > 0 ? "text-green-600" : "text-red-600"}`}>
                                        {tx.points > 0 ? "+" : ""}{tx.points}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="text-center py-4">No recent transactions for this customer.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    ) : (
        <div className="text-center py-10 text-gray-500">
            Please select a customer to view their loyalty dashboard.
        </div>
    )}
</div>
);
};

export default LoyaltyDashboard;