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

export const CustomersUsageChart = () => {
  const [data, setData] = useState<{ date: string; customers: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customers/usage"); // 👈 your route
        const json = await res.json();

        // Just demo: mapping the count into fake weekly data
        // Replace this with actual formatted backend data if available
        const chartData = [
          { date: "Week 1", customers: json.count },
          { date: "Week 2", customers: Math.floor(json.count * 0.9) },
          { date: "Week 3", customers: Math.floor(json.count * 1.1) },
          { date: "Week 4", customers: json.count },
        ];

        setData(chartData);
      } catch (err) {
        console.error("Failed to fetch customers usage:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div
      className="bg-[#E8E6D9] rounded-xl sm:rounded-[25px] p-3 sm:p-6 shadow-md sm:shadow-lg 
                  w-full h-[280px] sm:h-[350px] lg:h-[450px] 2xl:h-[490px] relative flex flex-col"
    >
      {/* Arrow button */}
      <div
        className="absolute top-3 right-3 sm:top-4 sm:right-4 
                    w-[24px] h-[24px] sm:w-[30px] sm:h-[30px] 2xl:w-[48px] 2xl:h-[48px] 
                    rounded-full border border-[#2C2A25] flex items-center justify-center"
      >
        <img
          src="arrow.png"
          alt="arrow"
          className="w-3 h-3 sm:w-4 sm:h-4 2xl:w-6 2xl:h-6"
        />
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
          {loading ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-[#B07C0D] border-t-transparent rounded-full animate-spin"></div>
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
