"use client";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { useEffect, useState } from "react";

interface PointsRedeemedChartProps {
  pointsRedeemed: number;
  loadingRedemption: boolean;
  chartType?: "bar" | "line";
  pointsHistory?: { week: string; issued: number; redeemed: number }[]; // New prop
}

export const PointsRedeemedChart = ({
  pointsRedeemed,
  loadingRedemption,
  chartType = "line",
  pointsHistory = [],
}: PointsRedeemedChartProps) => {
  const [data, setData] = useState<{ name: string; redeemed: number }[]>([]);

  useEffect(() => {
    if (!loadingRedemption && pointsHistory.length > 0) {
      // Map history data to chart format
      const chartData = pointsHistory.map((item) => ({
        name: item.week,
        redeemed: item.redeemed,
      }));
      setData(chartData);
    } else if (!loadingRedemption) {
        setData([]);
    }
  }, [pointsHistory, loadingRedemption]);

  return (
    <div className="bg-[#E8E6D9] p-4 rounded-2xl shadow-md w-full h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Customer Points Redeemed</h2>
      </div>

      {loadingRedemption ? (
        <div className="flex items-center justify-center flex-1">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-gray-500">
          No redemption data found.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                contentStyle={{
                  background: "#E8E6D9",
                  borderRadius: "10px",
                  border: "1px solid #e5e5e5",
                }}
              />
              <Bar dataKey="redeemed" fill="#22C55E" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                contentStyle={{
                  background: "#E8E6D9",
                  borderRadius: "10px",
                  border: "1px solid #e5e5e5",
                }}
              />
              <Line
                type="monotone"
                dataKey="redeemed"
                stroke="#734A00"
                strokeWidth={3}
                dot={{ r: 5, fill: "#734A00" }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
};
