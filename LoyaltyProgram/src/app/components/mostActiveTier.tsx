import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  LineChart,
} from "recharts";

const MostActiveTierChart = ({ mostActiveTier, loadingTier }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    console.log("🔍 Debug =>", { loadingTier, mostActiveTier });

    if (!loadingTier && mostActiveTier) {
      // Example: mostActiveTier = { name: "Gold", rate: "45.6%" }
      const tierName = mostActiveTier || "Unknown";
      const base = 80;

      if (isNaN(base)) {
        console.warn("⚠️ Tier rate is not a valid number:", 80);
        return;
      }

      // Generate mock relative tier data
      const generatedData = [
        { name: "Bronze", rate: +(base * 0.6).toFixed(2) },
        { name: "Silver", rate: +(base * 0.8).toFixed(2) },
        { name: "Gold", rate: base },
        { name: "Platinum", rate: +(base * 1.1).toFixed(2) },
        { name: "Diamond", rate: +(base * 1.25).toFixed(2) },
      ];

      setData(generatedData);
    }
  }, [mostActiveTier, loadingTier]);

  // Tier color palette
  const COLORS = {
    Bronze: "#cd7f32",
    Silver: "#c0c0c0",
    Gold: "#ffd700",
    Platinum: "#e5e4e2",
    Diamond: "#b9f2ff",
  };

  return (
    <div className="bg-[#E8E6D9] p-4 rounded-2xl shadow-xl w-full h-[400px] flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Most Active Tier</h2>

      {loadingTier ? (
        <div className="flex items-center justify-center flex-1">
          <div className="w-10 h-10 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-gray-700 font-medium">
          No tier activity data found.
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
              domain={[0, (dataMax) => Math.max(100, dataMax + 10)]}
              tickFormatter={(val) => `${val}%`}
              stroke="#734A00"
              tick={{ fontSize: 12, fontWeight: "500" }}
            />
            <Tooltip
              formatter={(val) => [`${Number(val).toFixed(2)}%`, "Activity"]}
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
              strokeWidth={3}
              dot={{ r: 6, stroke: "#734A00", strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 8, fill: "#734A00" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};


export default MostActiveTierChart;
