"use client";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { PieChartData } from "../data/customData";



const COLORS = ["#7B5C00", "#C2A46B"]; // Adjust shades like in figma

export const ActiveCustomersCard = () => {
  return (
    <div className="bg-[#F5F3EA] rounded-2xl p-6 shadow-sm w-full max-w-sm flex flex-col items-center">
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-base font-semibold text-[#2C2A25]">
          Active Customers
        </h2>
         <div className="w-[24px] h-[24px] sm:w-[30px] sm:h-[30px] 2xl:w-[48px] 2xl:h-[48px] 
                      rounded-full border border-[#2C2A25] flex items-center justify-center">
        <img src="arrow.png" alt="arrow" className="w-3 h-3 sm:w-4 sm:h-4 2xl:w-6 2xl:h-6" />
      </div>
      </div>

      {/* Donut Chart */}
      <div className="relative w-40 h-40">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={PieChartData}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {PieChartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-[#2C2A25]">100%</span>
          <span className="text-sm text-[#757575]">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#7B5C00]" />
          <span className="text-[#2C2A25]">Active Users</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#C2A46B]" />
          <span className="text-[#2C2A25]">Inactive Users</span>
        </div>
      </div>
    </div>
  );
};
