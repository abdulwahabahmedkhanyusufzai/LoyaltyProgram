"use client";
import { Abel } from "next/font/google";
import React from "react";

const tiers = [
  {label:"Welcomed: Less than 20 points",color:"#734A00"},
  {label:"Guest: Between 20 and 30 points",color:"#B47A11"},
  {label:"Host: Between 31 and 4500 points",color:"#402A00"},
  {label:"Test: More than 4500 points",color:"#384551"},
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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-[10px] justify-start">
            <img src="PremiumLoyalty.png" alt="" className="h-[37px] w-[37px]" />
            <h2 className="text-[14px] sm:text-2xl font-bold text-[#2C2A25]">
              Premium Loyalty Program
            </h2>
          </div>
          <div className="flex justify-center items-center gap-3 sm:gap-5">
            <button className="flex items-center justify-between px-3 sm:px-4 border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] h-[36px] sm:h-[44px] text-[12px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition">
              <span>Add New</span>
              <span className="text-[14px] sm:text-[18px]">+</span>
            </button>
            <button className="border rounded-[20px] sm:rounded-[25px] border-[#2C2A25] px-4 h-[36px] sm:h-[44px] text-[12px] sm:text-[14px] hover:bg-[#2C2A25] hover:text-white transition">
              Edit
            </button>
          </div>
        </div>

        <p className="my-[15px] text-sm sm:text-base text-[#2C2A25]">€10 = 1 point</p>

        {/* Responsive Table */}
        <div className="overflow-x-auto lg:overflow-x-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-sm sm:text-[14px] font-semibold text-[#2C2A25]">
                  Advantages
                </th>
                {tiers.map((tier, idx) => (
                  <th
                    key={idx}
                    className={`px-3 py-2 text-sm sm:text-[14px] font-semibold text-[${tier.color}] whitespace-nowrap"
                  `}>
                    {tier.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="text-xs sm:text-sm lg:text-[12px] 2xl:text-[14px]"
                >
                  <td className="px-3 py-2 font-medium text-[#2C2A25] whitespace-normal">
                    {row.label}
                  </td>
                  {row.values.map((val, i) => (
                    <td
                      key={i}
                      className="px-3 py-2 text-[#2C2A25] whitespace-normal"
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
