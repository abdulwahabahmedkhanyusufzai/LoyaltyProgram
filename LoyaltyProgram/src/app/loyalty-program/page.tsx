"use client";
import React from "react";
import { Header } from "../components/Header";

const tiers = [
  "Welcomed: Less than 20 points",
  "Guest: Between 20 and 30 points",
  "Host: Between 31 and 4500 points",
  "Test: More than 4500 points",
];

const rows = [
  {
    label: "Cashback per point",
    values: ["10 points = €10", "10 points = €10", "10 points = €13", "-"],
  },
  {
    label: "Free Delivery",
    values: [
      "From €400 spent over 2 years",
      "From €400 spent over 2 years",
      "From €400 spent over 2 years",
      "-",
    ],
  },
  {
    label: "Immediate Discount",
    values: ["5% on the first order", "10% cumulative", "15% + priority access", "-"],
  },
  {
    label: "Product Suggestions",
    values: [
      "Offer suggestion if purchasing from category X",
      "Offer suggestion if purchasing from one or more categories",
      "Offer of your choice if purchasing from one or more categories",
      "-",
    ],
  },
  {
    label: "Loyalty Offer",
    values: ["No", "5% on the 3rd order", "5% on the 3rd order", "-"],
  },
  {
    label: "Birthday Offer",
    values: [
      "15% on the order of your choice (valid 45 days)",
      "15% on the order of your choice (valid 45 days)",
      "15% on the order of your choice (valid 45 days)",
      "-",
    ],
  },
];

const PremiumLoyaltyProgram = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-7 space-y-8 bg-[#ffffff] min-h-screen">
    <div className="bg-[#F6F5EF] rounded-2xl border border-[#2C2A25] p-4 sm:p-6 lg:p-8 w-full">
      {/* Heading */}
      <div className="flex items-center justify-between">
      <div className="flex items-center justify-start mb-6">
        <img src="PremiumLoyalty.png" alt="" className="h-[37px] w-[37px]"/>
        <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A25]">
          Premium Loyalty Program
        </h2>
        </div>
           <div className="flex justify-center items-center gap-5">
          <button className="flex items-center justify-between px-3 sm:px-4 border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] h-[40px] sm:h-[44px] text-[13px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition">
            <span>Add New</span>
            <span className="text-[16px] sm:text-[18px]">+</span>
          </button>
          <button className="border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] px-4 h-[40px] sm:h-[44px] text-[13px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition">
            Edit
          </button>
          </div>
        </div>
        <p className="my-[20px] text-sm sm:text-base text-[#2C2A25] mt-1">€10 = 1 point</p>
      

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead>
            <tr>
              <th className="border border-[#D2D1CA] px-3 py-2 text-left text-sm sm:text-base font-semibold text-[#2C2A25]">
                Advantages
              </th>
              {tiers.map((tier, idx) => (
                <th
                  key={idx}
                  className="border border-[#D2D1CA] px-3 py-2 text-sm sm:text-base font-semibold text-[#B07C0D]"
                >
                  {tier}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="text-xs sm:text-sm lg:text-base">
                <td className="border border-[#D2D1CA] px-3 py-2 font-medium text-[#2C2A25]">
                  {row.label}
                </td>
                {row.values.map((val, i) => (
                  <td
                    key={i}
                    className="border border-[#D2D1CA] px-3 py-2 text-[#2C2A25]"
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default PremiumLoyaltyProgram;
