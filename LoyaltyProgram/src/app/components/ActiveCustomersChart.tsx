"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#7B5C00", "#C2A46B"]; // Active / Inactive

export const ActiveCustomersCard = () => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveCustomers = async () => {
      try {
        const res = await fetch("/api/customers/usage"); // 👈 replace if you have a different route
        const json = await res.json();

        // Example split: 70% active, 30% inactive (adjust based on real API fields)
        const active = Math.floor(json.count * 0.7);
        const inactive = json.count - active;

        setData([
          { name: "Active Users", value: active },
          { name: "Inactive Users", value: inactive },
        ]);
      } catch (err) {
        console.error("Failed to fetch active customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCustomers();
  }, []);

  return (
    <div className="bg-[#F5F3EA] h-[280px] sm:h-[350px] lg:h-[450px] 2xl:h-[490px] rounded-2xl p-6 shadow-sm w-full flex flex-col items-center">
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-base font-semibold text-[#2C2A25]">
          Active Customers
        </h2>
      
      </div>

      {/* Donut Chart / Loader */}
      <div className="relative w-60 h-60 flex items-center justify-center">
        {loading ? (
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-[#7B5C00] border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Center Label */}
        {!loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-[#2C2A25]">
              {(
                (data[0].value / (data[0].value + data[1].value)) *
                100
              ).toFixed(0)}
              %
            </span>
            <span className="text-sm text-[#757575]">Active</span>
          </div>
        )}
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
