import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const AverageRedemptionRateChart = ({ redemptionRate, loadingRedemption }) => {
  const [data, setData] = useState([]);

useEffect(() => {
  console.log("🔍 Debug =>", { loadingRedemption, redemptionRate, type: typeof redemptionRate });

  if (!loadingRedemption && redemptionRate != null) {
    const base = Number(String(redemptionRate).replace('%', '').trim());

    if (isNaN(base)) {
      console.log("⚠️ Redemption rate is not a valid number:", redemptionRate);
      return;
    }

    const generatedData = [
      { name: "Jan", rate: +(base * 0.85).toFixed(2) },
      { name: "Feb", rate: +(base * 0.9).toFixed(2) },
      { name: "Mar", rate: +(base * 1.05).toFixed(2) },
      { name: "Apr", rate: +(base * 1.1).toFixed(2) },
      { name: "May", rate: +(base * 0.95).toFixed(2) },
      { name: "Jun", rate: +(base * 1.15).toFixed(2) },
    ];

    console.log("✅ Generated Data:", generatedData);
    setData(generatedData);
  }
}, [redemptionRate, loadingRedemption]);


  return (
    <div className="bg-[#E8E6D9] p-4 rounded-2xl shadow-xl w-full h-[400px] flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        Average Redemption Rate (%)
      </h2>

      {loadingRedemption ? (
        <div className="flex items-center justify-center flex-1">
          {/* Spinner */}
          <div className="w-10 h-10 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-gray-700 font-medium">
          No redemption rate data found.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#CFCBC0" />

            <XAxis
              dataKey="name"
              stroke="#734A00"
              tick={{ fontSize: 12, fontWeight: "500" }}
            />

            <YAxis
              domain={[0, (dataMax) => Math.max(120, dataMax + 10)]}
              tickFormatter={(val) => `${val}%`}
              stroke="#734A00"
              tick={{ fontSize: 12, fontWeight: "500" }}
            />

            <Tooltip
              formatter={(val) => [`${Number(val).toFixed(2)}%`, "Rate"]}
              labelStyle={{ color: "#734A00", fontWeight: "bold" }}
              itemStyle={{ color: "#000000" }}
              contentStyle={{
                background: "#ffffff",
                borderRadius: "10px",
                border: "1px solid #734A00",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            />

            <Line
              type="monotone"
              dataKey="rate"
              stroke="#734A00"
              strokeWidth={4}
              dot={{ r: 5, fill: "#734A00" }}
              activeDot={{ r: 8, stroke: "#734A00", fill: "#FFD700" }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AverageRedemptionRateChart;
