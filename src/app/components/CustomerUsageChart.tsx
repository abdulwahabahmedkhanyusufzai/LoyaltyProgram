"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const CustomersUsageChart = ({ activeCustomersHistory = [] }) => {
  const [data, setData] = useState<{ date: string; customers: number }[]>([]);

  useEffect(() => {
    if (activeCustomersHistory.length > 0) {
        setData(activeCustomersHistory);
    } else {
        setData([]);
    }
  }, [activeCustomersHistory]);

  return (
    <div
      className="bg-[#E8E6D9] rounded-xl sm:rounded-[25px] p-3 sm:p-6 shadow-md sm:shadow-lg 
                  w-full h-[280px] sm:h-[350px] lg:h-[450px] 2xl:h-[490px] relative flex flex-col"
    >
     

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
          {data.length === 0 ? (
          <div className="flex items-center justify-center w-full h-full text-gray-500">
            No active customer data.
          </div>
        ) : (
          <LineChart
            data={data}
            margin={{ top: 20, right: 15, left: 25, bottom: 30 }}
          >
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#2C2A25", fontSize: 10, fontWeight: 600 }}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "#2C2A25", fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              label={{
                value: "Number of Customers",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fill: "#B07C0D",
                  fontWeight: 700,
                  fontSize: 10,
                },
              }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="customers"
              stroke="#B07C0D"
              strokeWidth={2}
              dot={{ r: 3, fill: "#B07C0D", stroke: "#B07C0D" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Footer label */}
      <div
        className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 
                    text-[10px] sm:text-[12px] 2xl:text-[14px] font-bold text-[#B07C0D]"
      >
        Per Week
      </div>
    </div>
  );
};
